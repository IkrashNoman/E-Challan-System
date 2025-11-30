/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useRef } from "react";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";

interface Admin {
  id: number;
  name: string;
  rank: string;
  city: string;
  area: string;
  subArea: string;
  profilePicture: string;
  email: string;
  password: string;
  status: boolean;
}

// Rank options from low to high
const rankOptions = [
  "Constable",
  "Head Constable", 
  "ASI (Assistant Sub Inspector)",
  "SI (Sub Inspector)",
  "Inspector"
];

// City options
const cities = [
  "Lahore",
  "Faisalabad", 
  "Rawalpindi",
  "Islamabad",
  "Peshawar",
  "Quetta",
  "Karachi",
  "Multan"
];

// Area and sub-area data structure
const cityAreas: Record<string, Record<string, string[]>> = {
  "Lahore": {
    "Lahore Cantonment & Nearby": [
      "DHA Phase 1–13", "Cantt", "Saddar", "Cavalry Ground", "Walton", "Nishat Colony",
      "Abid Majeed Road Area", "Sarwar Road Area", "Askari 5", "Askari 10", "Askari 11",
      "Gohawa", "Burki Road Area"
    ],
    "Gulberg & Surroundings": [
      "Gulberg I", "Gulberg II", "Gulberg III", "Gulberg IV", "Gulberg V",
      "Liberty Market Area", "Main Boulevard Gulberg", "Garden Town", "Muslim Town"
    ],
    "Model Town & Adjacent Areas": [
      "Model Town", "Model Town Extension", "Faisal Town", "Township",
      "Quaid-e-Azam Industrial Estate", "Green Town"
    ],
    "Johar Town & Canal Area": [
      "Johar Town Phase 1", "Johar Town Phase 2", "Wafaqi Colony",
      "PCSIR Housing Society Phase 1", "PCSIR Phase 2", "Canal View",
      "Canal Bank Housing Scheme"
    ],
    "Allama Iqbal Town Zone": [
      "Allama Iqbal Town", "Wahdat Colony", "Karim Block", "Sikandar Block",
      "Rachna Block", "Gulshan-e-Ravi", "Samanabad", "Islamia Park"
    ],
    "Historic & Central Lahore": [
      "Walled City", "Anarkali", "Mozang", "Garhi Shahu",
      "Lakshmi Chowk & Railway Station Area", "Lower Mall", "Upper Mall", "Jail Road Area"
    ],
    "Shalimar & Northern Lahore": [
      "Shalimar Town", "Baghbanpura", "Singhpura", "China Scheme", "UET Area",
      "Mughalpura", "Canal View Housing Scheme", "Daroghawala"
    ],
    "Aziz Bhatti Town / Eastern Lahore": [
      "Harbanspura", "Tajpura", "Mustafabad", "Ghaziabad", "Manawan", "Batapur",
      "Mian Mir Colony", "Tajbagh"
    ],
    "Raiwind & Southern Extension": [
      "Bahria Town Lahore", "Bahria Orchard", "Lake City", "Valencia Town", "Pine Avenue",
      "NFC Phase 1", "NFC Phase 2", "New Lahore City", "Raiwind City Area"
    ],
    "Lahore South (Defence Road Corridor)": [
      "Etihad Town", "DHA Rahbar", "Khayaban-e-Amin", "Fazaia Housing Scheme",
      "AWT Phase 1 & 2", "LDA Avenue 1"
    ],
    "Western Lahore": [
      "WAPDA Town", "PIA Housing Society", "LDA Township", "Kahna Nau", "Green Cap Housing",
      "Ferozepur Road Localities"
    ],
    "Wahga / Northern Eastern Belt": [
      "Wahga Town", "Jallo", "Kala Shah Kaku (Greater Lahore Influence Area)",
      "Paragon City", "Air Avenue Housing", "Eden City"
    ],
    "Other Prominent Societies & Areas": [
      "Bahria Nasheman", "Al-Rehman Garden (Phases 1–7)", "Al-Kabir Town (Phase 1–3)",
      "Kings Town", "Jubilee Town", "Izmir Town", "Army Welfare Trust Scheme",
      "Punjab University Housing", "Eden Villas (multiple sites)", "Airport Road Localities"
    ]
  },
  "Faisalabad": {
    "Faisalabad City (Central Area)": [
      "Clock Tower (Ghanta Ghar)", "Eight Bazaars Area", "Jinnah Colony", "D Ground",
      "Peoples Colony No. 1", "Peoples Colony No. 2", "Civil Lines", "Railway Road Area",
      "Katchery Bazar", "Chenab Chowk Area"
    ],
    "Madina Town & Surrounding Areas": [
      "Madina Town", "Eden Valley", "Canal Road", "Abdullah Gardens", "Officers Colony",
      "Gulistan Colony", "Jaranwala Road Area (early section)"
    ],
    "Samanabad & East Faisalabad": [
      "Samanabad", "Millat Chowk", "Millat Town", "Mansoorabad", "Gulshan Colony",
      "Muslim Town", "Naimat Colony"
    ],
    "Sarghoda Road / North Faisalabad": [
      "Sargodha Road", "Khayaban Colony 1", "Khayaban Colony 2", "Shadab Colony",
      "Green Town", "Nishatabad", "New Green Town", "Manawala", "Makkoana"
    ],
    "Jaranwala Road Belt": [
      "Jaranwala Road", "Canal View Housing Scheme", "Citi Housing Faisalabad",
      "Eden Gardens", "Sunflower Housing Society", "Palm City", "FDA City"
    ],
    "Millat Road & Adjacent Localities": [
      "Millat Road", "Gulshan-e-Haider", "Shalimar Park", "Razabad", "Taj Colony",
      "Bawa Chak", "Ghulam Muhammadabad"
    ],
    "Samundari Road Corridor": [
      "Samundari Road", "Satiana Road Interlink Area", "Model City 1", "Model City 2",
      "Dream Gardens", "Orchard Homes"
    ],
    "Canal Road (Southern Belt)": [
      "Canal Road", "Canal Gardens", "Canal Park", "Officers Colony Extension",
      "Wapda Town", "Eden Garden Extension", "Tech Town (Satiana Road)"
    ],
    "Satiana Road / South Faisalabad": [
      "Satiana Road", "Prime City", "Valencia Gardens", "Saeed Colony", "Saeed Colony No. 2",
      "Tariqabad", "Barkat Pura"
    ],
    "Faisalabad Industrial Areas": [
      "Industrial Estate Sargodha Road", "Faisalabad Industrial Estate (M3 Industrial City)",
      "Small Industrial Area", "Kohinoor Industrial Estate", "Jhumra Road Industrial Area"
    ],
    "West Faisalabad / Jhang Road": [
      "Jhang Road", "Kamalpur", "Ismail Road Area", "Kaleem Shaheed Colony",
      "Punjab Small Industrial Estate", "Ghulam Mohammadabad"
    ],
    "Chak / Suburban Town Areas": [
      "Dijkot", "Khurrianwala", "Jhumra (Chak Jhumra)", "Tandlianwala", "Mamu Kanjan",
      "Gatti", "Laliani Belt", "Chak 7 JB", "Chak 208 RB", "Chak 225 RB", "Chak 235 RB", "Chak 476 GB"
    ],
    "Prominent Housing Societies": [
      "Citi Housing Faisalabad", "WAPDA City", "FDA City", "Model City 1 & 2",
      "Eden Valley", "Eden Garden", "Eden Garden Extension", "Dream Garden",
      "Palm City", "Prime Homes", "Grand City Faisalabad", "Pearl City"
    ]
  },
  "Rawalpindi": {
    "Rawalpindi Cantonment (RCB Areas)": [
      "Saddar", "Chaklala Scheme I", "Chaklala Scheme II", "Chaklala Scheme III",
      "Chaklala Cantt", "Harley Street", "R.A. Bazaar", "Westridge I", "Westridge II",
      "Westridge III", "Misrial Road", "Tulsa Road", "Lalazar", "Gulistan Colony",
      "Adiala Road (partial cantonment side)"
    ],
    "Rawal Town & Central Rawalpindi": [
      "Raja Bazaar", "Trunk Bazar", "Murree Road", "College Road", "Liaquat Bagh Area",
      "Banni", "Dhoke Khabba", "Dhoke Hassu", "Dhoke Ratta", "Dhoke Elahi Bakhsh",
      "Saidpur Road", "Satellite Town", "Sadiqabad", "Shamsabad", "Asghar Mall"
    ],
    "Satellite Town & Surrounding Areas": [
      "Satellite Town A–E Block", "Commercial Market Area", "Holy Family Road",
      "6th Road Area", "4th B Road", "Tariqabad", "Muslim Town"
    ],
    "Chaklala & Airport Surroundings": [
      "Chaklala", "Chaklala Railway Station Area", "Railway Housing Scheme",
      "Chaklala Scheme 3 Extension", "Shah Faisal Colony", "Gulzar-e-Quaid (Airport Housing Society)",
      "Airport Road Belt"
    ],
    "Bahria Town / DHA Zone": [
      "Bahria Town Phase 1", "Bahria Town Phase 2", "Bahria Town Phase 3", "Bahria Town Phase 4",
      "Bahria Town Phase 5", "Bahria Town Phase 6", "Bahria Town Phase 7", "Bahria Town Phase 8",
      "Bahria Orchard", "DHA Phase 1", "DHA Phase 2", "DHA Phase 3 (under development)",
      "DHA Valley (adjacent)", "DHA Expressway Belt"
    ],
    "Adiala Road & Surrounding Areas": [
      "Adiala Road Main", "Gulshanabad", "Kalyanabad", "Defence Road Housing (various societies)",
      "High Court Society", "Rose Garden Housing", "Khabba Chowk Extension", "Shadman Town",
      "Dhamyal Road", "Villages along Adiala belt"
    ],
    "Peshawar Road / Westridge Belt": [
      "Peshawar Road", "Westridge I", "Westridge II", "Westridge III", "Kohinoor Mills Area",
      "CSD Area", "Tahli Mohri", "Misrial Road", "Dhoke Gujran", "Dhok Mangtal"
    ],
    "Murree Road & North-East Rawalpindi": [
      "Mareer Chowk", "Committee Chowk", "Liaquat Bagh", "Benazir Hospital Area",
      "Amarpura", "Tipu Road Area", "Bhabra Bazar", "Naya Mohalla"
    ],
    "Rawalpindi South / GT Road Belt": [
      "Dhok Kala Khan", "Kurri Road", "Chaklala Road", "Gulistan-e-Fatima",
      "Gulraiz Housing Society", "Media Town (near Islamabad boundary)",
      "Police Foundation", "PWD Housing (Islamabad border area)"
    ],
    "Old Town & Traditional Mohallas": [
      "Kartarpura", "Mohanpura", "Bhabra Bazaar", "Purana Qila", "Bani Market Area",
      "Narankari Bazaar", "City Saddar Road", "Waris Khan", "Arya Mohalla"
    ],
    "Rawalpindi Bypass / Ring Road / Outer Belt": [
      "Gorakhpur", "Chakri Road", "Al-Haram City", "Capital Smart City (near Chakri)",
      "Blue World City (Chakri Road)", "Abdullah City", "Khanial Homes", "Mivida City",
      "Multi Gardens Phase 2 (near Thalian)", "Thalian Interchange Area"
    ],
    "Prominent Housing Societies (City & Suburban)": [
      "Bahria Town (1–8)", "DHA (1–3)", "Gulraiz Housing Scheme", "Judicial Colony",
      "Police Foundation", "Army Officers Colony", "Bahria Orchard", "River Gardens",
      "Khyber City", "Airport Housing Society", "Defence Road Housing Schemes",
      "Safari Valley (inside Bahria Town)", "River View Commercial"
    ],
    "Semi-Urban / Town Areas in Rawalpindi District": [
      "Taxila", "Wah Cantt", "Gujar Khan", "Kahuta", "Kallar Syedan",
      "Fateh Jang (bordering district area)", "Chakri", "Dhamial", "Chak Jalal Din",
      "Morgah", "Khanna Pul (border zone)"
    ]
  },
  "Islamabad": {
    "Islamabad Sectors (Zone 1 – CDA Sectors)": [
      "A-11", "A-12 (under development)", "A-13", "A-14", "A-15", "A-16", "A-17",
      "B-17 (Multi Gardens)", "B-18 (mostly reserved)", "B-19 (future development)",
      "C-16", "C-17", "C-18", "C-19", "D-12", "D-13", "D-14", "D-15", "D-16 (various societies)",
      "E-7", "E-8", "E-9", "E-10", "E-11", "E-12", "E-13 (reserved)", "E-14", "E-15",
      "F-5", "F-6", "F-7", "F-8", "F-9 (Fatima Jinnah Park)", "F-10", "F-11", "F-12 (under development)",
      "G-5", "G-6", "G-7", "G-8", "G-9", "G-10", "G-11", "G-12 (under development)", "G-13",
      "G-14 (1, 2, 3, 4)", "G-15", "H-8", "H-9", "H-10", "H-11", "H-12", "H-13 (near Kashmir Highway)",
      "H-14 (developing)", "I-8", "I-9", "I-10", "I-11", "I-12 (under development)", "I-14", "I-15", "I-16"
    ],
    "Islamabad Model Towns / Housing Schemes": [
      "G-15", "E-17 (Engineers Housing)", "B-17 Multi Gardens", "Cabinet Division Housing",
      "Faisal Town", "Faisal Residencia", "Jhangi Syedan Area", "Top City-1", "Mumtaz City",
      "Capital Smart City (adjacent zone)", "PECHS Housing", "Chak Shahzad", "Bani Gala",
      "Park Enclave Phase 1", "Park Enclave Phase 2", "Kuri Road Belt", "Bahria Enclave Islamabad",
      "Shahzad Town", "Alipur Farash", "Jinnah Gardens (FECHS)", "Naval Farms", "OPF Housing Scheme",
      "PTV Colony", "DHA Islamabad (Phases 1–6)", "DHA Valley", "DHA Expressway Belt",
      "Bahria Town Phase 1–8 (Islamabad jurisdiction)", "Korang Town", "PWD Housing Society",
      "Police Foundation O-9", "Pakistan Town", "Media Town", "Soan Garden", "Gulberg Greens",
      "Gulberg Residencia", "Naval Anchorage", "Jinnah Garden Phase 1 & 2", "Ghori Town Phases 1–8"
    ],
    "Blue Area & Islamabad Central Business District": [
      "Blue Area (Jinnah Avenue)", "Constitution Avenue", "Red Zone", "Supreme Court Area",
      "Parliament Area", "Diplomatic Enclave"
    ],
    "Villages & Suburban Areas (Greater Islamabad)": [
      "Tarlai", "Sihala", "Rawat", "Kirpa", "Koral", "Tumair", "Tramri", "Bhara Kahu",
      "Malot", "Shah Allah Ditta", "Golra Sharif", "Shah Pur", "Dhoke Kala Khan (border area)"
    ],
    "Prominent Private Housing Societies (New Islamabad Belt)": [
      "Gulberg Greens", "Gulberg Residencia", "Top City-1", "Mumtaz City", "Airport Green Gardens",
      "Eighteen Islamabad", "Capital Smart City", "Khanial Homes", "Taj Residencia",
      "University Town", "Silver City", "Blue World City (border region with Rwp)", "RUDN Enclave"
    ]
  },
  "Peshawar": {
    "Old City Areas": [
      "Andar Shehr", "Qissa Khwani", "Chowk Yadgar", "Ganj", "Mohallah Jangi", "Karimpura",
      "Hashtnagri", "Lahori Gate", "Kohati Gate", "Bajauri Gate", "Ramdas", "Shoba Bazaar"
    ],
    "Central Peshawar (Mid-City)": [
      "Saddar", "Cantonment (Peshawar Cantt)", "Gulbahar", "Faqirabad", "Nishtarabad",
      "Gulberg", "Wazir Bagh", "Shaheen Muslim Town", "Afghan Colony", "Zaryab Colony"
    ]
  },
  "Karachi": {
    "Karachi Central District (Urban Core)": [
      "Liaquatabad", "Nazimabad", "North Nazimabad", "Paposh Nagar", "Sharifabad",
      "Buffer Zone", "Al-Hilal Society", "Liaquatabad Scheme 1–6", "Gulberg Town (Karachi Central portion)",
      "Site Area (Karachi Central portion)"
    ],
    "Karachi East District": [
      "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "University Road Area", "Gulshan-e-Maymar (border area)",
      "Safoora Goth", "Scheme 33 (Karachi East portion)", "Landhi Road Belt", "Scheme 36 (partial)",
      "Block-7 & Block-8 (Gulshan)"
    ],
    "Karachi West District": [
      "Orangi Town (Orangi 1–10)", "Mominabad", "Banaras Colony", "Baldia Town", "Gulshan-e-Hadeed",
      "Saeedabad", "Qasba Colony", "Surjani Town", "Maripur", "SITE Industrial Area (West portion)"
    ],
    "Karachi South District": [
      "Saddar", "Clifton", "Defence (DHA Karachi Phases 1–8)", "Korangi Creek Cantonment",
      "Parsi Colony", "Civil Lines", "Lyari", "Keamari", "Hawksbay Area", "Manora"
    ],
    "Karachi Malir District": [
      "Malir Cantonment", "Airport Road Belt", "Model Colony", "Korangi Road Vicinity",
      "Ibrahim Hyderi", "Saudabad", "Shanti Nagar", "Landhi Industrial Belt (Malir portion)",
      "Bin Qasim Town", "Malir City"
    ],
    "Karachi Korangi District": [
      "Korangi Town (1–6)", "Korangi Industrial Area", "Shah Faisal Colony", "Metroville",
      "Landhi Town (Korangi portion)", "Model Colony (Korangi portion)", "Zaman Town", "Bhitai Colony"
    ],
    "Prominent Private Housing Schemes / Societies": [
      "Gulshan-e-Maymar", "Gulistan-e-Jauhar (Block-wise subdivisions)", "Malir Cantonment Societies",
      "Scheme 33 Societies", "Taiser Town", "Saima Arabian Villas", "Karachi Co-operative Housing Societies (KCHS)"
    ],
    "Major Roads & Commercial Belts": [
      "Shahrah-e-Faisal Commercial Belt", "University Road Commercial Area", "Korangi Road Business Zone",
      "M.A. Jinnah Road", "I.I. Chundrigar Road (Stock Exchange)", "Clifton Commercial Strip",
      "Saddar Bazaar & Surrounding Markets"
    ],
    "Villages & Peripheral Areas (Greater Karachi / Suburbs)": [
      "Gadap Town", "Malir Town Peripheral Villages", "Mauripur", "Manghopir", "Ibrahim Hyderi Village",
      "Thatta Road Belt", "Kati Pahari", "Hub Creek Vicinity"
    ], 
    "DHA Karachi":[
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Phase 5",
        "Phase 6",
        "Phase 7",
        "Phase 8",
    ],
    "Clifton Block":[
        "Block 1",
        "Block 2",
        "Block 3",
        "Block 4",
        "Block 5",
        "Block 6",
        "Block 7",
        "Block 8",
        "Block 9",
        "Block 10",
        "Block 11",
        "Block 12",
        "Block 13",
        "Block 14",
        "Block 15",
        "Block 16"
    ], 
    "Bahria Town Karachi":[
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Phase 5",
        "Phase 6",
        "Phase 7",
        "Phase 8",
        "Phase 9"
    ]
  },
  "Multan": {
    "Multan City (Old City Areas)": [
      "Hussain Agahi", "Ghanta Ghar", "Chowk Bazar", "Chowk Azam", "Chowk Rani Bagh",
      "Ghazi Road Area", "Shah Rukn-e-Alam Colony", "Hussainabad", "Sher Shah Colony",
      "Purani Multan", "Qasim Bagh"
    ],
    "Multan Cantt & Surroundings": [
      "Multan Cantonment", "Civil Lines", "Multan Cantt Housing", "Masoom Shah Colony",
      "Gulgasht Colony", "Fawara Chowk Area", "Lodhi Colony"
    ],
    "Multan North / Residential Areas": [
      "Bosan Road Area", "Shershah Colony", "Nawabpur", "Qasim Colony", "Gulshan-e-Madina",
      "Gulshan-e-Hafiz", "New Multan Housing Societies"
    ],
    "Multan South / Suburban Areas": [
      "Jalalpur Pirwala Road Belt", "Vehari Road Belt", "Shujabad Road Belt",
      "Shah Rukn-e-Alam University Surroundings", "Ali Pur", "Muzaffar Garh Road Vicinity",
      "Pak Arab Housing Scheme (South Multan)"
    ],
    "Major Roads & Commercial Belts": [
      "Bosan Road Commercial Strip", "Abdali Road Market", "Multan Road (Old City)",
      "Cantt Road", "Shujabad Road Markets", "Vehari Road Commercial Area",
      "Chowk Azam Market", "Pak Arab Road Commercial Areas"
    ],
    "Prominent Housing Societies & Private Colonies": [
      "Pak Arab Housing Society", "Gulgasht Colony", "Housing Society Multan Cantt",
      "Fawara Chowk Residential Areas", "New Multan Housing Projects", "Shershah Colony (developing)",
      "Qasim Colony", "Multan Housing Scheme 1", "Multan Housing Scheme 2"
    ],
    "Villages & Peripheral Areas (Greater Multan)": [
      "Jalalpur Pirwala", "Shujabad", "Khanewal Road Villages", "Vehari Road Villages",
      "Muzaffargarh Road Belt Villages", "Lodhran Road Belt", "Ghazi Ghat", "Basti Maluk", "Peer Muhammad"
    ]
  },
  "Quetta": {
    "Quetta City (Old City Areas / Central Quetta)": [
      "Liaqat Bazaar", "Sandeman Road", "Hanna Lake Road Vicinity", "Fatima Jinnah Road Area",
      "Zarghoon Road Area", "Jinnah Town", "Bolan Town", "Sariab Road Area",
      "Chaman Road Commercial Belt", "Pishin Road Area", "Zarghoonabad"
    ],
    "Quetta Cantt & Military Areas": [
      "Quetta Cantonment (Cantt)", "Civil Lines", "Brewery Road Area", "Gulistan-e-Johar Colony",
      "Askari Housing Society", "Sariab Road Cantt Vicinity", "Zarghoon Housing Colony",
      "Killi Gulistan"
    ],
    "Quetta West / Residential Suburbs": [
      "Satellite Town", "Zarghoon Town", "Brewery Housing Society", "University Road Area (UoB vicinity)",
      "Sariab Suburbs", "Killi Gulzar", "Quetta Housing Society", "Zarghoon Road Extension"
    ],
    "Quetta North / Suburban Areas": [
      "Hanna Lake Surroundings", "Hoshab Road Belt", "Saidu Colony", "Sariab Colony",
      "Killi Kachhi", "Hazara Town", "Killi Abdullah", "Quetta University Vicinity"
    ],
    "Major Roads & Commercial Belts": [
      "Jinnah Road (Main Commercial)", "Zarghoon Road", "Sariab Road", "Chaman Road",
      "Brewery Road", "University Road Commercial Strip", "Sandeman Road Markets",
      "Fatima Jinnah Road Markets"
    ],
    "Prominent Housing Societies & Private Colonies": [
      "Askari Housing Society Quetta", "Zarghoon Housing Society", "Quetta Housing Scheme",
      "Bolan Town", "Brewery Housing Scheme", "Satellite Town Residential Blocks",
      "University Housing Colony", "Zarghoon Town Residential Areas"
    ],
    "Villages & Peripheral Areas (Greater Quetta Region)": [
      "Hanna Lake Villages", "Pishin", "Killi Kachhi", "Killi Abdullah", "Kuchlak",
      "Muslim Bagh Road Belt", "Ziarat Road Villages", "Harnai Road Vicinity",
      "Nokkundi Road Belt"
    ]
  }
};

export default function AddOther() {
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, name: "John Doe", rank: "Inspector", city: "Lahore", area: "Gulberg & Surroundings", subArea: "Gulberg I", profilePicture: "", email: "john@example.com", password: "********", status: true },
    { id: 2, name: "Jane Smith", rank: "SI (Sub Inspector)", city: "Islamabad", area: "Islamabad Sectors (Zone 1 – CDA Sectors)", subArea: "F-7", profilePicture: "", email: "jane@example.com", password: "********", status: true },
    { id: 3, name: "Mike Johnson", rank: "Constable", city: "Karachi", area: "Karachi South District", subArea: "Clifton", profilePicture: "", email: "mike@example.com", password: "********", status: false },
  ]);

  const [newAdmin, setNewAdmin] = useState<Omit<Admin, "id" | "status">>({
    name: "",
    rank: "",
    city: "",
    area: "",
    subArea: "",
    profilePicture: "",
    email: "",
    password: "",
  });

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"add" | "view">("view");

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");

  const sortRef = useRef<HTMLSelectElement>(null);

  // Get areas based on selected city
  const getAreas = () => {
    if (!newAdmin.city) return [];
    return Object.keys(cityAreas[newAdmin.city] || {});
  };

  // Get sub-areas based on selected city and area
  const getSubAreas = () => {
    if (!newAdmin.city || !newAdmin.area) return [];
    return cityAreas[newAdmin.city]?.[newAdmin.area] || [];
  };

  // Similar functions for editing admin
  const getEditAreas = () => {
    if (!editingAdmin?.city) return [];
    return Object.keys(cityAreas[editingAdmin.city] || {});
  };

  const getEditSubAreas = () => {
    if (!editingAdmin?.city || !editingAdmin?.area) return [];
    return cityAreas[editingAdmin.city]?.[editingAdmin.area] || [];
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.rank || !newAdmin.city || !newAdmin.area) return;
    setAdmins([
      ...admins,
      {
        id: admins.length + 1,
        ...newAdmin,
        status: true,
      },
    ]);
    setNewAdmin({
      name: "",
      rank: "",
      city: "",
      area: "",
      subArea: "",
      profilePicture: "",
      email: "",
      password: "",
    });
    if (window.innerWidth < 768) setMobileView("view");
  };

  const handleEditAdmin = (updatedAdmin: Admin) => {
    setAdmins(admins.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a)));
    setEditingAdmin(null);
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter((a) => a.id !== id));
    setEditingAdmin(null);
  };

  const filteredAdmins = useMemo(() => {
    let data = [...admins];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.rank.toLowerCase().includes(s) ||
          a.city.toLowerCase().includes(s) ||
          a.area.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s)
      );
    }

    switch (sortOption) {
      case "name-asc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rank-asc":
        data.sort((a, b) => rankOptions.indexOf(a.rank) - rankOptions.indexOf(b.rank));
        break;
      case "rank-desc":
        data.sort((a, b) => rankOptions.indexOf(b.rank) - rankOptions.indexOf(a.rank));
        break;
      case "city-asc":
        data.sort((a, b) => a.city.localeCompare(b.city));
        break;
      case "city-desc":
        data.sort((a, b) => b.city.localeCompare(a.city));
        break;
    }

    return data;
  }, [admins, search, sortOption]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isEditing && editingAdmin) {
          setEditingAdmin({ ...editingAdmin, profilePicture: event.target?.result as string });
        } else {
          setNewAdmin({ ...newAdmin, profilePicture: event.target?.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* MOBILE NAV */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b pb-4 relative z-20">
          <h2 className="text-xl font-bold text-text">
            {mobileView === "add" ? "Add New Admin" : "Existing Admins"}
          </h2>
          <div className="relative">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <img
                src={mobileMenuOpen ? "/images/menu-close-icon.png" : "/images/dropdown-icon.png"}
                alt="Menu"
                className="w-8 h-8"
              />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-surface border shadow-xl rounded-md overflow-hidden z-30">
                <button
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100 ${mobileView === "view" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("view"); setMobileMenuOpen(false); }}
                >
                  View Existing Admins
                </button>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${mobileView === "add" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("add"); setMobileMenuOpen(false); }}
                >
                  Add New Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ADD NEW ADMIN */}
        <div className={`${mobileView === "add" ? "block" : "hidden"} md:block mb-10`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">Add Admin</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text mb-1">Name *</label>
              <input
                type="text"
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Enter admin name"
              />
            </div>
            <div>
              <label className="block text-text mb-1">Rank *</label>
              <select
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.rank}
                onChange={(e) => setNewAdmin({ ...newAdmin, rank: e.target.value })}
              >
                <option value="">Select Rank</option>
                {rankOptions.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text mb-1">City *</label>
              <select
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.city}
                onChange={(e) => setNewAdmin({ ...newAdmin, city: e.target.value, area: "", subArea: "" })}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text mb-1">Area *</label>
              <select
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.area}
                onChange={(e) => setNewAdmin({ ...newAdmin, area: e.target.value, subArea: "" })}
                disabled={!newAdmin.city}
              >
                <option value="">Select Area</option>
                {getAreas().map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text mb-1">Sub Area</label>
              <select
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.subArea}
                onChange={(e) => setNewAdmin({ ...newAdmin, subArea: e.target.value })}
                disabled={!newAdmin.area}
              >
                <option value="">Select Sub Area</option>
                {getSubAreas().map((subArea) => (
                  <option key={subArea} value={subArea}>{subArea}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text mb-1">Profile Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                className="p-2 border rounded bg-surface w-full"
                onChange={(e) => handleProfilePictureChange(e, false)}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Email *</label>
              <input
                type="email"
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-text mb-1">Password *</label>
              <input
                type="password"
                className="p-2 border rounded bg-surface w-full"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-brand w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddAdmin}
            disabled={!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.rank || !newAdmin.city || !newAdmin.area}
          >
            Add Admin
          </button>
        </div>

        {/* VIEW / EDIT EXISTING */}
        <div className={`${mobileView === "view" ? "block" : "hidden"} md:block`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">
            View/Edit Existing Admins
          </h2>

          {/* SEARCH + SORT */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            {/* SEARCH WITH ICON */}
            <div className="relative w-full md:w-1/2">
              <img
                src="/images/search-icon.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search by name, rank, city, area, or email..."
                className="pl-10 p-2 border rounded bg-surface w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* SORT ICON ONLY */}
            <div className="relative flex items-center justify-end md:ml-auto mr-2">
              <select
                ref={sortRef}
                className="absolute pointer-events-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rank-asc">Rank (Low to High)</option>
                <option value="rank-desc">Rank (High to Low)</option>
                <option value="city-asc">City (A-Z)</option>
                <option value="city-desc">City (Z-A)</option>
              </select>

              {/* Visible icon button */}
              <img
                src="/images/sort-icon.png"
                className="w-6 h-6 cursor-pointer opacity-80"
                onClick={() => sortRef.current?.showPicker?.()}
                alt="Sort"
              />
            </div>
          </div>

          {/* ADMINS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg"
                onClick={() => setEditingAdmin(admin)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {admin.profilePicture ? (
                    <img
                      src={admin.profilePicture}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-text text-sm">No Image</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-text">{admin.name}</h3>
                    <p className="text-text-secondary text-sm">{admin.rank}</p>
                  </div>
                </div>
                <p className="text-text-secondary">City: {admin.city}</p>
                <p className="text-text-secondary">Area: {admin.area}</p>
                {admin.subArea && <p className="text-text-secondary">Sub Area: {admin.subArea}</p>}
                <p className="text-text-secondary">Email: {admin.email}</p>
                <p className="text-text-secondary">
                  Status: {admin.status ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT MODAL */}
        {editingAdmin && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl"
                onClick={() => setEditingAdmin(null)}
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4">Edit Admin</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text mb-1">Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.name}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Rank</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.rank}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, rank: e.target.value })
                    }
                  >
                    <option value="">Select Rank</option>
                    {rankOptions.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">City</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.city}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, city: e.target.value, area: "", subArea: "" })
                    }
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Area</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.area}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, area: e.target.value, subArea: "" })
                    }
                    disabled={!editingAdmin.city}
                  >
                    <option value="">Select Area</option>
                    {getEditAreas().map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Sub Area</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.subArea}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, subArea: e.target.value })
                    }
                    disabled={!editingAdmin.area}
                  >
                    <option value="">Select Sub Area</option>
                    {getEditSubAreas().map((subArea) => (
                      <option key={subArea} value={subArea}>{subArea}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="p-2 border rounded bg-surface w-full"
                    onChange={(e) => handleProfilePictureChange(e, true)}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Email</label>
                  <input
                    type="email"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.email}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Password</label>
                  <input
                    type="password"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.password}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, password: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Status</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editingAdmin.status ? "active" : "inactive"}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, status: e.target.value === "active" })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-brand flex-1"
                  onClick={() => handleEditAdmin(editingAdmin)}
                >
                  Save Changes
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
                  onClick={() => handleDeleteAdmin(editingAdmin.id)}
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}