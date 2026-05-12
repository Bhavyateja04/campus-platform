// ─────────────────────────────────────────
//  test-api.js  →  AboutScreen
// ─────────────────────────────────────────

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ── University Overview ──────────────────
export const getUniversityInfo = async () => {
  await delay();
  return {
    name: 'Aditya University',
    location: 'Surampalem, Andhra Pradesh',
    naacRating: 'A+',
    established: 2001,
    logoUrl: require('../../assets/aditya.jpg'), // local asset
    website: 'https://www.adityauniversity.in',
    email: 'info@adityauniversity.in',
    instagram: '@adityauniversity',
    tagline: 'Excellence in Education & Innovation',
  };
};

// ── Stats (NAAC badge row + stats grid) ─
export const getUniversityStats = async () => {
  await delay(300);
  return [
    { val: 'A+',   label: 'NAAC Rating', icon: 'ribbon-outline'  },
    { val: '12K+', label: 'Students',    icon: 'people-outline'  },
    { val: '200+', label: 'Faculty',     icon: 'person-outline'  },
    { val: '50+',  label: 'Departments', icon: 'school-outline'  },
  ];
};

// ── Campus Gallery (slideshow) ───────────
export const getCampusImages = async () => {
  await delay(350);
  return [
    {
      id: '1',
      uri: 'https://ik.imagekit.io/lhb4hvprkpz/wifi_2tU1IcdcN.jpg?updatedAt=1627469037857',
      caption: 'Wi-Fi Enabled Campus',
    },
    {
      id: '2',
      uri: 'https://ik.imagekit.io/lhb4hvprkpz/hostel-1_3mKkzFot1.jpg?updatedAt=1627470077377',
      caption: 'Hostel Facility',
    },
    {
      id: '3',
      uri: 'https://ik.imagekit.io/lhb4hvprkpz/zym_ZoidnRVOV.jpg?updatedAt=1627469080425',
      caption: 'Sports & Fitness',
    },
  ];
};

// ── About Split Cards ────────────────────
export const getAboutSections = async () => {
  await delay(300);
  return [
    {
      id: 'about',
      heading: 'Aditya University',
      body: 'One of the leading institutions in Andhra Pradesh, known for academic excellence, innovation, and modern campus facilities.',
      imageUri: 'https://ik.imagekit.io/lhb4hvprkpz/1_ycquTeVGC.jpg?updatedAt=1627469248691',
      imageLeft: true,
    },
    {
      id: 'holistic',
      heading: 'Holistic Development',
      body: 'Students are encouraged to participate in technical events, cultural activities, placements, research programs, and student clubs.',
      imageUri: 'https://ik.imagekit.io/lhb4hvprkpz/2_Gq3MZHfTS.jpg?updatedAt=1627469249245',
      imageLeft: false,
    },
  ];
};

// ── University Facilities ────────────────
export const getUniversityFeatures = async () => {
  await delay(300);
  return [
    {
      id: 'library',
      icon: 'library-outline',
      label: 'Central Library',
      desc: 'Modern digital and physical library facilities',
      color: '#4A6FA5',
    },
    {
      id: 'labs',
      icon: 'desktop-outline',
      label: 'Computer Labs',
      desc: 'Advanced laboratories with latest technology',
      color: '#6A1B9A',
    },
    {
      id: 'clubs',
      icon: 'people-outline',
      label: 'Student Clubs',
      desc: 'Technical, cultural and social activity clubs',
      color: '#E07B3A',
    },
    {
      id: 'placements',
      icon: 'briefcase-outline',
      label: 'Placements',
      desc: 'Top placement training and recruitment drives',
      color: '#00796B',
    },
    {
      id: 'research',
      icon: 'flask-outline',
      label: 'Research Labs',
      desc: 'Innovation and research focused laboratories',
      color: '#2E4D7A',
    },
    {
      id: 'sports',
      icon: 'football-outline',
      label: 'Sports Facilities',
      desc: 'Indoor and outdoor sports infrastructure',
      color: '#1565C0',
    },
    {
      id: 'campus',
      icon: 'business-outline',
      label: 'Modern Campus',
      desc: 'Smart classrooms and modern infrastructure',
      color: '#6A1B9A',
    },
    {
      id: 'cafeteria',
      icon: 'cafe-outline',
      label: 'Cafeteria',
      desc: 'Healthy food and spacious dining areas',
      color: '#00796B',
    },
  ];
};

// ── Contact Info ─────────────────────────
export const getContactInfo = async () => {
  await delay(250);
  return [
    {
      id: 'website',
      icon: 'globe-outline',
      label: 'Website',
      val: 'www.adityauniversity.in',
      color: '#4A6FA5',
      url: 'https://www.adityauniversity.in',
    },
    {
      id: 'email',
      icon: 'mail-outline',
      label: 'Email',
      val: 'info@adityauniversity.in',
      color: '#00796B',
      url: 'mailto:info@adityauniversity.in',
    },
    {
      id: 'instagram',
      icon: 'logo-instagram',
      label: 'Instagram',
      val: '@adityauniversity',
      color: '#6A1B9A',
      url: 'https://www.instagram.com/adityauniversity',
    },
  ];
};