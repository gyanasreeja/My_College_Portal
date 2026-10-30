// Change the college details here. Everything on the site reads from this one file.
const college = {
  shortName: "ANITS",
  name: "Anil Neerukonda Institute of Technology & Sciences",
  portalTitle: "Academic Portal",
  tagline: "Results, attendance and campus updates in one place",

  // Put your photos in the frontend/public folder with these names.
  heroImage: "/college.jpg", // wide campus photo (about 1600x700)
  logo: "/logo.png",         // optional square logo; a text badge shows if missing

  address: "Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam Dist, Andhra Pradesh, India",
  phone: "",  // fill in the number you want shown, for example "+91 00000 00000"
  email: "",  // fill in the email you want shown, for example "info@yourcollege.edu"
  social: [], // optional, for example [{ label: "Instagram", url: "https://instagram.com/..." }]

  // Home page slider. Add photos to frontend/public/images/ (slide1.jpg ... slide4.jpg).
  // A missing photo is fine: the slide falls back to /college.jpg and then to a colour gradient.
  slideImages: ["/images/slide1.jpg", "/images/slide2.jpg", "/images/slide3.jpg", "/images/slide4.jpg"],
  aboutImage: "/images/campus.jpg",
  // Campus life gallery (photo in public/images, caption shown on the tile)
  gallery: [
    { image: "/images/gallery1.jpg", caption: "Main campus" },
    { image: "/images/gallery2.jpg", caption: "Classrooms and labs" },
    { image: "/images/gallery3.jpg", caption: "Hackathons and fests" },
    { image: "/images/gallery4.jpg", caption: "Sports and clubs" },
    { image: "/images/gallery5.jpg", caption: "Convocation" },
    { image: "/images/gallery6.jpg", caption: "Placements" },
  ],

  accreditations: ["NAAC A+", "NBA Accredited", "UGC Autonomous", "AICTE Approved"],

  about: [
    "ANITS, Visakhapatnam, was established in the academic year 2001-02 by the Anil Neerukonda " +
      "Educational Society, founded by Dr. N.B.R. Prasad together with industrialists and educationists " +
      "in memory of his son, the late Anil Neerukonda.",
    "The institute holds the NAAC A+ grade, is a UGC autonomous institution recognised by AICTE and " +
      "Andhra University, and has NBA accredited programmes.",
  ],
  facts: [
    ["5k+", "Active students"],
    ["20k+", "Alumni"],
    ["390", "Teaching staff"],
    ["50%+", "Faculty with PhDs"],
    ["50+", "Research projects"],
    ["200+", "Patents"],
  ],
  recruiters: ["Capgemini", "Tech Mahindra", "Verizon", "Comtec", "Amazon", "IBM", "Deloitte", "Infosys"],

  disclaimer: "Student project built for learning. This is not the official college website.",
};

export default college;