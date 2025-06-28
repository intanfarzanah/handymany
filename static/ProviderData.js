// provider data
const providers = [
  {
    id: 1,
    name: "Ali Bin Abu",
    specializations: ["Wiring"],
    gender: "Male",
    price_rate_per_hour: 60,
    location: "Selangor",
    contact: "01122334455",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Repaired home wiring for 10 clients",
      "Installed security system for office",
      "Upgraded electrical panel in residential building",
    ],
    address: "Bangi",
    lat: 2.9141,
    lng: 101.7629
  },
  {
    id: 2,
    name: "Siti Aminah",
    specializations: ["Plumbing"],
    gender: "Female",
    price_rate_per_hour: 35,
    location: "Kuala Lumpur",
    contact: "0198765432",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 5,
    history: [
      "Fixed leaking pipes for 5 houses",
      "Installed new water heaters",
      "Maintained commercial plumbing system"
    ],
    address: "Damansara Heights",
    lat: 3.1511,
    lng: 101.6576
  },
  {
    id: 3,
    name: "Aniq Rasyid",
    specializations: ["Carpentry"],
    gender: "Male",
    price_rate_per_hour: 55,
    location: "Selangor",
    contact: "0123456789",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 3,
    history: [
      "Built custom furniture",
      "Renovated kitchen cabinets"
    ],
    address: "Cyberjaya",
    lat: 2.9202,
    lng: 101.6559
  },
  {
    id: 4,
    name: "Aisha Binti Omar",
    specializations: ["Painting"],
    gender: "Female",
    price_rate_per_hour: 30,
    location: "Johor",
    contact: "0178899001",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 4,
    history: [
      "Painted residential homes",
      "Commercial building exterior paint"
    ],
    address: "Johor Bahru",
    lat: 1.4927,
    lng: 103.7414
  },
  {
    id: 5,
    name: "Mohammad Farid",
    specializations: ["Plumbing", "Roofing"],
    gender: "Male",
    price_rate_per_hour: 50,
    location: "Malacca",
    contact: "0132233445",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 5,
    history: [
      "Designed backyard gardens",
      "Maintained commercial lawns"
    ],
    address: "Alor Gajah",
    lat: 2.3833,
    lng: 102.2167
  },
  {
    id: 6,
    name: "Nurul Huda",
    specializations: ["Painting", "Carpentry"],
    gender: "Female",
    price_rate_per_hour: 40,
    location: "Pahang",
    contact: "0193344556",
    booked: false,
    verified: false,
    isStudentPartner: false,
    rating: 3,
    history: [
      "Office cleaning services",
      "Residential deep cleaning"
    ],
    address: "Kuantan",
    lat: 3.8077,
    lng: 103.326
  },
  {
    id: 7,
    name: "David Lee",
    specializations: ["Wiring"],
    gender: "Male",
    price_rate_per_hour: 60,
    location: "Selangor",
    contact: "0167788990",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 5,
    history: [
      "Installed lighting systems",
      "Repaired electrical faults"
    ],
    address: "Petaling Jaya",
    lat: 3.1073,
    lng: 101.6067
  },
  {
    id: 8,
    name: "Fatimah Zakaria",
    specializations: ["Plumbing", "Tiling"],
    gender: "Female",
    price_rate_per_hour: 35,
    location: "Perak",
    contact: "0145566778",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 4,
    history: [
      "Installed bathroom fixtures",
      "Tiled kitchen backsplash"
    ],
    address: "Ipoh",
    lat: 4.5975,
    lng: 101.0901
  },
  {
    id: 9,
    name: "Azman Hashim",
    specializations: ["Roofing"],
    gender: "Male",
    price_rate_per_hour: 45,
    location: "Seremban",
    contact: "0133344556",
    booked: false,
    verified: false,
    isStudentPartner: false,
    rating: 2,
    history: [
      "Repaired leaking roofs",
      "Installed solar panels"
    ],
    address: "Nilai",
    lat: 2.8166667,
    lng: 101.8
  },
  {
    id: 10,
    name: "Lee Mei Ling",
    specializations: ["Painting"],
    gender: "Female",
    price_rate_per_hour: 40,
    location: "Selangor",
    contact: "0122999888",
    booked: false,
    verified: false,
    isStudentPartner: false,
    rating: 5,
    history: [
      "Designed modern apartments",
      "Decorated office spaces"
    ],
    address: "Kajang",
    lat: 2.9927,
    lng: 101.7872
  },
  {
    id: 11,
    name: "Hafiz Mohd",
    specializations: ["Appliances Repair", "Wiring"],
    gender: "Male",
    price_rate_per_hour: 65,
    location: "Selangor",
    contact: "0181122334",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Installed split AC units",
      "Maintained cooling systems"
    ],
    address: "Puncak Alam",
    lat: 3.1873,
    lng: 101.4462
  },
  {
    id: 12,
    name: "Saraswathy",
    specializations: ["Tiling"],
    gender: "Female",
    price_rate_per_hour: 30,
    location: "Malacca",
    contact: "0175566778",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 3,
    history: [
      "Built brick walls",
      "Restored historical buildings"
    ],
    address: "Masjid Tanah",
    lat: 2.3712897,
    lng: 102.0773641
  },
  {
    id: 13,
    name: "Rajesh Kumar",
    specializations: ["Plumbing", "Roofing"],
    gender: "Male",
    price_rate_per_hour: 55,
    location: "Johor",
    contact: "0192233445",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Fixed pipe leaks",
      "Welded metal gates"
    ],
    address: "Skudai",
    lat: 1.53741,
    lng: 103.65779
  },
  {
    id: 14,
    name: "Nor Aini",
    specializations: ["Carpentry"],
    gender: "Female",
    price_rate_per_hour: 40,
    location: "Terengganu",
    contact: "0134455667",
    booked: false,
    verified: false,
    isStudentPartner: false,
    status: "Available",
    rating: 5,
    history: [
      "House cleaning",
      "Office sanitation"
    ],
    address: "Kuala Terengganu",
    lat: 5.329,
    lng: 103.1362
  },
  {
    id: 15,
    name: "Michael Ong",
    specializations: ["Plumbing", "Wiring"],
    gender: "Male",
    price_rate_per_hour: 60,
    location: "Penang",
    contact: "0167788991",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Installed network cables",
      "Maintained electrical systems"
    ],
    address: "Seberang Perai",
    lat: 5.3849,
    lng: 100.4814
  },
  {
    id: 16,
    name: "Jessica Lim",
    specializations: ["Appliances Repair", "Painting"],
    gender: "Female",
    price_rate_per_hour: 35,
    location: "Kuala Lumpur",
    contact: "0123777889",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 3,
    history: [
      "Built wardrobes",
      "Painted office walls"
    ],
    address: "Cheras",
    lat: 3.0803,
    lng: 101.7405
  },
  {
    id: 17,
    name: "Farhan Aziz",
    specializations: ["Roofing", "Wiring"],
    gender: "Male",
    price_rate_per_hour: 65,
    location: "Selangor",
    contact: "0199988776",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 5,
    history: [
      "Replaced roof shingles",
      "Installed new wiring systems"
    ],
    address: "Shah Alam",
    lat: 3.0738,
    lng: 101.5183
  },
  {
    id: 18,
    name: "Amira Syafiqah",
    specializations: ["Plumbing", "Wiring"],
    gender: "Female",
    price_rate_per_hour: 45,
    location: "Selangor",
    contact: "01133445566",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Repaired kitchen plumbing",
      "Assisted with home rewiring projects"
    ],
    address: "Subang Jaya",
    lat: 3.0738,
    lng: 101.5183
  },
  {
    id: 19,
    name: "Nadira Husna",
    specializations: ["Carpentry", "Painting"],
    gender: "Female",
    price_rate_per_hour: 40,
    location: "Negeri Sembilan",
    contact: "0188877665",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 5,
    history: [
      "Custom wooden shelf construction",
      "Painted studio apartment interiors"
    ],
    address: "Seremban",
    lat: 2.7297,
    lng: 101.9381
  },
  {
    id: 20,
    name: "Zulaikha Anuar",
    specializations: ["Tiling"],
    gender: "Female",
    price_rate_per_hour: 35,
    location: "Penang",
    contact: "0128899771",
    booked: false,
    verified: true,
    isStudentPartner: false,
    rating: 4,
    history: [
      "Bathroom tiling for student hostels",
      "Kitchen wall tiling for homes"
    ],
    address: "Gelugor",
    lat: 5.373,
    lng: 100.295
  },
  {
    id: 21,
    name: "Aiman Hakim",
    specializations: ["Wiring", "Appliances Repair"],
    gender: "Male",
    price_rate_per_hour: 50,
    location: "Kuala Lumpur",
    contact: "0191234567",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 4,
    history: [
      "Repaired fan motors in hostel",
      "Helped install electrical outlets in rental units"
    ],
    address: "Setapak",
    lat: 3.2018,
    lng: 101.7265
  },
  {
    id: 22,
    name: "Syazwan Naim",
    specializations: ["Carpentry"],
    gender: "Male",
    price_rate_per_hour: 38,
    location: "Selangor",
    contact: "0174567890",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 3,
    history: [
      "Assisted in making bookshelves for a library",
      "Built benches for school courtyard"
    ],
    address: "Ampang",
    lat: 3.1442,
    lng: 101.7639
  },
  {
    id: 23,
    name: "Faiz Daniel",
    specializations: ["Painting", "Roofing"],
    gender: "Male",
    price_rate_per_hour: 42,
    location: "Johor",
    contact: "0138899776",
    booked: false,
    verified: false,
    isStudentPartner: true,
    rating: 4,
    history: [
      "Painted fences and gates for houses",
      "Helped fix roof leaks after heavy rain"
    ],
    address: "Pasir Gudang",
    lat: 1.4734,
    lng: 103.902
  }
];

module.exports = providers;
