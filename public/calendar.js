(function() {
    const API_BASE = 'http://localhost:5000/api';

    const calendarDaysEl = document.getElementById('calendarDays');
    const monthYearEl = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');

    const timeSlotsSection = document.getElementById('timeSlotsSection');
    const timeSlotsEl = document.getElementById('timeSlots');
    const timeSlotLoading = document.getElementById('timeSlotLoading');
    const timeSlotError = document.getElementById('timeSlotError');

    const bookingForm = document.getElementById('bookingForm');
    const selectedDateInput = document.getElementById('selectedDate');
    const selectedTimeInput = document.getElementById('selectedTime');
    const submitBtn = bookingForm.querySelector('button.submit-btn');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const formError = document.getElementById('formError');

    let currentYear, currentMonth;
    let selectedDate = null;
    let selectedTimeSlot = null;

    // All possible time slots available (must match backend's all_slots)
    const TIME_SLOTS = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
    ];

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateReadable(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    function isDateInRange(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        maxDate.setHours(23, 59, 59, 999);
        return date >= today && date <= maxDate;
    }

    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    function renderCalendar(year, month) {
        calendarDaysEl.innerHTML = '';
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearEl.textContent = monthNames[month] + ' ' + year;

        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startingDay; i++) {
            let emptyCell = document.createElement('div');
            emptyCell.classList.add('day', 'disabled');
            emptyCell.setAttribute('aria-hidden', 'true');
            calendarDaysEl.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            let dayDate = new Date(year, month, day);
            let dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = day;
            dayEl.setAttribute('role', 'gridcell');
            dayEl.setAttribute('tabindex', '-1');
            dayEl.setAttribute('aria-label', formatDateReadable(dayDate));

            if (!isDateInRange(dayDate) || isWeekend(dayDate)) {
                dayEl.classList.add('disabled');
                dayEl.removeAttribute('tabindex');
            } else {
                dayEl.addEventListener('click', () => {
                    if (selectedDate) {
                        let prevSelectedDayEl = Array.from(calendarDaysEl.children).find(el => el.classList.contains('selected'));
                        if (prevSelectedDayEl) prevSelectedDayEl.classList.remove('selected');
                    }
                    selectedDate = new Date(year, month, day);
                    dayEl.classList.add('selected');
                    selectedDateDisplay.textContent = "Selected Date: " + formatDateReadable(selectedDate);
                    selectedDateInput.value = formatDate(selectedDate);

                    selectedTimeSlot = null;
                    selectedTimeInput.value = '';
                    submitBtn.disabled = true;

                    fetchAndRenderTimeSlots(selectedDate);

                    validateForm();
                });
                dayEl.setAttribute('tabindex', '0');
                dayEl.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        dayEl.click();
                    }
                });
            }
            calendarDaysEl.appendChild(dayEl);
        }

        if (!selectedDate || selectedDate.getFullYear() !== year || selectedDate.getMonth() !== month) {
            selectedDate = null;
            selectedDateDisplay.textContent = "Please select a date";
            selectedDateInput.value = '';
            timeSlotsSection.style.display = 'none';
            selectedTimeSlot = null;
            selectedTimeInput.value = '';
            submitBtn.disabled = true;
            clearTimeSlots();
        } else if (selectedDate.getFullYear() === year && selectedDate.getMonth() === month) {
            let selectedDayEl = Array.from(calendarDaysEl.children).find(el => {
                if (el.classList.contains('day') && !el.classList.contains('disabled')) {
                    const day = parseInt(el.textContent);
                    const date = new Date(year, month, day);
                    return formatDate(date) === formatDate(selectedDate);
                }
                return false;
            });
            if (selectedDayEl) {
                selectedDayEl.classList.add('selected');
            }
        }
    }

    function clearTimeSlots() {
        timeSlotsEl.innerHTML = '';
        timeSlotError.style.display = 'none';
        timeSlotLoading.style.display = 'none';
    }

    async function fetchAndRenderTimeSlots(date) {
        clearTimeSlots();
        timeSlotsSection.style.display = 'block';
        timeSlotLoading.style.display = 'block';
        timeSlotError.style.display = 'none';

        const dateStr = formatDate(date);
        console.log("Fetching availability for:", dateStr);

        try {
            const res = await fetch(`${API_BASE}/availability?date=${dateStr}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error fetching availability: ${res.status}`);
            }
            const data = await res.json();
            const availableSlots = data.available_slots || [];

            timeSlotsEl.innerHTML = '';
            if (availableSlots.length === 0) {
                timeSlotsEl.innerHTML = '<em>No availability on this date.</em>';
                submitBtn.disabled = true;
                selectedTimeSlot = null;
                selectedTimeInput.value = '';
                return;
            }

            TIME_SLOTS.forEach(slot => {
                let slotEl = document.createElement('div');
                slotEl.classList.add('time-slot');
                slotEl.textContent = slot;
                slotEl.setAttribute('role', 'listitem');
                if (!availableSlots.includes(slot)) {
                    slotEl.classList.add('disabled');
                    slotEl.setAttribute('aria-disabled', 'true');
                    slotEl.style.cursor = 'default';
                    // Disable pointer events to prevent clicking
                    slotEl.style.pointerEvents = 'none';
                } else {
                    slotEl.setAttribute('tabindex', '0');
                    slotEl.addEventListener('click', () => {
                        let prevSelected = timeSlotsEl.querySelector('.time-slot.selected');
                        if (prevSelected) prevSelected.classList.remove('selected');
                        slotEl.classList.add('selected');
                        selectedTimeSlot = slot;
                        selectedTimeInput.value = selectedTimeSlot;
                        validateForm();
                    });
                    slotEl.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            slotEl.click();
                        }
                    });
                }
                timeSlotsEl.appendChild(slotEl);
            });
        } catch (err) {
            console.error("Error fetching time slots:", err);
            timeSlotError.textContent = err.message || 'Failed to load availability. Please try again later.';
            timeSlotError.style.display = 'block';
            submitBtn.disabled = true;
            selectedTimeSlot = null;
            selectedTimeInput.value = '';
        } finally {
            timeSlotLoading.style.display = 'none';
        }
    }

    function validateForm() {
        // Check if all required inputs are filled and valid
        const isFormValid = bookingForm.checkValidity() && selectedDate && selectedTimeSlot;

        console.log("Form validity:", bookingForm.checkValidity());
        console.log("Selected Date:", selectedDate);
        console.log("Selected Time Slot:", selectedTimeSlot);

        // Enable or disable the submit button accordingly
        submitBtn.disabled = !isFormValid;

        // Optionally, you can add visual feedback for the button state here

        return isFormValid;
    }

    bookingForm.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    bookingForm.addEventListener('submit', async e => {
        e.preventDefault();
        formError.style.display = 'none';
        confirmationMessage.style.display = 'none';

        if (!validateForm()) {
            formError.textContent = "Please complete all required fields and select a date/time.";
            formError.style.display = 'block';
            return;
        }

        const bookingData = {
            name: bookingForm.name.value.trim(),
            email: bookingForm.email.value.trim(),
            phone: bookingForm.phone.value.trim(),
            address: bookingForm.address.value.trim(),
            serviceType: bookingForm.serviceType.value,
            notes: bookingForm.notes.value.trim(),
            date: selectedDateInput.value,
            time: selectedTimeInput.value,
            providerId: getProviderIdFromURL()
        };

        console.log('Booking data to be sent:', bookingData);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            let responseData;
            try {
                responseData = await res.json();
            } catch (jsonErr) {
                throw new Error("Server returned invalid response.");
            }

            if (!res.ok) {
                formError.textContent = responseData.error || 'Booking failed. Please try again.';
                formError.style.display = 'block';
                return;
            }

            if (res.ok) {
                // Show booking success modal
                showBookingSuccessModal(bookingData);
                // Send notification
                sendBookingNotification(bookingData.email, `Your booking for ${bookingData.serviceType} on ${bookingData.date} at ${bookingData.time} was successful.`);
                // Reset form and calendar
                bookingForm.reset();
                selectedDate = null;
                selectedTimeSlot = null;
                selectedDateInput.value = '';
                selectedTimeInput.value = '';
                selectedDateDisplay.textContent = "Please select a date";
                timeSlotsSection.style.display = 'none';
                clearTimeSlots();
                renderCalendar(currentYear, currentMonth);
            } else {
                formError.textContent = responseData.error || 'Booking failed. Please try again.';
                formError.style.display = 'block';
            }
        } catch (err) {
            console.error("Error submitting booking:", err);
            formError.textContent = 'Network or server error occurred. Please try again later.';
            formError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Service';
        }
    });

    function getProviderIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('providerId');
    }

    // Function to send booking notification
    async function sendBookingNotification(email, message) {
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });
            if (!res.ok) {
                console.error('Failed to send notification');
            }
        } catch (err) {
            console.error('Error sending notification:', err);
        }
    }

    // Function to create and show booking success modal
    function showBookingSuccessModal(bookingData) {
        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'bookingSuccessModalOverlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.zIndex = '10000';

        const modal = document.createElement('div');
        modal.id = 'bookingSuccessModal';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';

        const message = document.createElement('p');
        message.textContent = `Booking Successful! Thank you, ${bookingData.name}. Your ${bookingData.serviceType} service is booked for ${bookingData.date} at ${bookingData.time}.`;

        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.style.margin = '10px';
        dismissBtn.style.padding = '10px 20px';
        dismissBtn.style.border = 'none';
        dismissBtn.style.backgroundColor = '#431837';
        dismissBtn.style.color = '#fff';
        dismissBtn.style.borderRadius = '5px';
        dismissBtn.style.cursor = 'pointer';
        dismissBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back to Home';
        backBtn.style.margin = '10px';
        backBtn.style.padding = '10px 20px';
        backBtn.style.border = 'none';
        backBtn.style.backgroundColor = '#8ba286';
        backBtn.style.color = '#fff';
        backBtn.style.borderRadius = '5px';
        backBtn.style.cursor = 'pointer';
        backBtn.addEventListener('click', () => {
            window.location.href = '/index_backup.html';
        });

        modal.appendChild(message);
        modal.appendChild(dismissBtn);
        modal.appendChild(backBtn);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    async function loadServiceTypes() {
        try {
            // Extract providerId from URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const providerId = urlParams.get('providerId');
            if (!providerId) {
                console.error('Provider ID not found in URL');
                return;
            }

            // Fetch provider details
            const res = await fetch(`${API_BASE}/providers/${providerId}`);
            if (!res.ok) throw new Error('Failed to fetch provider details');
            const provider = await res.json();

            const serviceTypeSelect = document.getElementById('serviceType');
            if (!serviceTypeSelect) {
                console.error('Service type select element not found');
                return;
            }
            while (serviceTypeSelect.options.length > 1) {
                serviceTypeSelect.remove(1);
            }

            // Use only the provider's specializations
            const specializations = provider.specializations || [];
            specializations.forEach(spec => {
                const option = document.createElement('option');
                option.value = spec;
                option.textContent = spec.charAt(0).toUpperCase() + spec.slice(1);
                serviceTypeSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error loading service types:', err);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        renderCalendar(currentYear, currentMonth);
        selectedDateDisplay.textContent = "Please select a date";
        loadServiceTypes();

        // Autofill name and email if user info is stored in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT token payload
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && payload.email && payload.fullname) {
                    const nameInput = document.getElementById('name');
                    const emailInput = document.getElementById('email');
                    if (nameInput) nameInput.value = payload.fullname;
                    if (emailInput) emailInput.value = payload.email;
                }
            } catch (err) {
                console.error('Failed to decode token for autofill:', err);
            }
        }
    });
})();
