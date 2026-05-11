# Aditya University Smart Student App

A digital platform designed to solve everyday campus problems and improve the overall student experience at **Aditya University**.

---

# Introduction

University students often face many small but common problems in their daily campus life. These problems include:

- Losing personal items
- Difficulty navigating the campus
- Long waiting times in canteens
- Lack of access to second-hand study materials
- Difficulty finding placement guidance
- Lack of communication about university events or notices

To address these issues, we propose the development of the **Aditya University Smart Student App**.

This application will act as a **centralized digital platform** that connects students, provides essential university information, and helps solve everyday campus problems through various services.

The application will provide:

- Public access mode for visitors or external students
- Secure login system for university students

The goal of this application is to:

- Improve the student experience
- Reduce manual processes
- Create a more connected digital campus

---

# Types of Users

The application supports two types of users.

## Public Users

Public users can access certain features without logging into the system.

These users include:

- Visitors
- Parents
- External students attending exams
- New students exploring the campus

## Student Users

Students must log in using their **official college email ID** to access full features of the application.

---

# Public Access Features

Public users can access useful university information without creating an account.

## College Information

Public users can view basic information about the university including:

- Overview of Aditya University
- Important contact details
- Information about departments
- Facilities available on campus

This helps visitors and new students understand the campus better.

---

## College Map and Navigation

The application provides a **digital campus map** to help users navigate the university.

Users can:

- View the complete campus map
- Search for buildings or locations
- Get directions from their current location

Examples of locations include:

- Academic Blocks
- Library
- Laboratories
- Canteens
- Administrative Offices
- Auditoriums

This feature is especially useful for **new students and visitors who are unfamiliar with the campus layout**.

---

## Exam Hall Locator for External Students

External students who visit the university to write exams often struggle to find their exam halls.

To solve this problem, the application provides an **Exam Hall Locator**.

Students can enter their **Roll Number or Hall Ticket Number**.

If the data exists in the system, the application will display:

- Student Name
- Exam Hall Number
- Building Name
- Floor Number

The application will also provide **navigation to the exact exam hall using the campus map**, eliminating the need for manual display boards at the entrance.

---

# Student Login System

Students must log in using their **official university email ID**.

## Login Process

1. Students log in using their college email address
2. The system provides a **default password**
3. Students are required to **change the password during their first login**
4. After changing the password, students gain access to the **full application dashboard**

This ensures that only **authorized university students** can access the platform.

---

# Core Features for Students

After logging in, students gain access to several features designed to solve common campus problems.

---

# Lost and Found System

Students often lose items such as:

- Wallets
- ID cards
- Calculators
- Mobile phones

The **Lost and Found section** allows students to report lost items and post found items.

## Reporting a Lost Item

Students can create a post including:

- Item Name
- Item Description
- Photo of the Item
- Location where it was lost
- Date and Time
- Contact Details

## Reporting a Found Item

Students who find an item can post:

- Photo of the Item
- Location where it was found
- Date and Time
- Contact Details

Students who lost the item can directly contact the person who found it.

### AI-Based Item Matching (Optional)

An AI system analyzes:

- Images of lost items
- Images of found items
- Location data

The system compares the images and provides a **similarity score**.

Example:

Lost wallet image vs Found wallet image → **85% similarity**

---

# Second-Hand Study Marketplace

Students often need textbooks or academic materials but buying new ones can be expensive.

The application includes a **second-hand marketplace** where students can buy and sell study-related items.

## Selling an Item

Students can list items with:

- Item Name
- Image
- Price
- Description
- Contact Details
- Category (Books, Electronics, etc.)

## Buying an Item

Students can browse available items and contact the seller directly.

### Filtering Options

Users can filter items by:

- Price
- Category
- Condition
- Quality

Once an item is sold, the seller can remove the listing.

---

# Smart Campus Map and Navigation

Students can easily navigate within the campus using the built-in map.

Features include:

- Searching for buildings
- Selecting destinations
- Getting directions from the current location

This helps students quickly locate classrooms, labs, or offices.

---

# Smart Canteen System

Students often spend time waiting in long queues at campus canteens.

The application provides a **canteen ordering system** to reduce waiting time.

## Features

Students can:

- View menus from different canteens
- Check prices
- Pre-order food

## Payment Options

### Platform Service Fee

Students pay a small service fee per order.

Example:

Order Amount ₹100 → Service Fee ₹5  
Order Amount ₹150 → Service Fee ₹10

### Partial Advance Payment

Students pay **50% of the order amount in the app**.

When they arrive at the canteen:

- They collect the order
- Pay the remaining amount directly

This reduces queues and improves service efficiency.

---

# Placement Experience Sharing

Students who get placed in companies can share their **interview experiences** to help juniors.

Placement information can be obtained from the **placement department database**.

When a student logs in:

- Their company placement is already recorded in the system.

Students can share:

- Interview rounds
- Questions asked
- Preparation strategies
- Advice for juniors

### AI Experience Summarization (Optional)

If multiple students share experiences about the same company, AI can generate a **summary of common patterns**.

Example:

Company: Amazon

Summary:

- Focus on Data Structures
- Coding rounds were difficult
- System design questions asked

---

# Clubs Information

The application provides information about all university clubs.

Examples include:

- Coding Club
- Robotics Club
- Cultural Club
- Photography Club
- Music Club

Each club page contains:

- Club description
- Activities conducted
- Contact details of club coordinators

Students interested in joining can contact the coordinators directly.

---

# General Notices and Announcements

Important university announcements will be posted through the application.

Examples include:

- Holiday announcements
- Exam schedules
- Event notifications
- Academic updates

Students receive **push notifications** for important announcements.

Example notification:

Tomorrow is a holiday due to a university event.

---

# College Memories

Students can share their **campus memories**.

Students can post:

- Photos
- Short descriptions
- Personal experiences

Other students can:

- View posts
- Like posts
- Read shared memories

### AI Content Moderation

AI analyzes:

- Images
- Text content

The system detects:

- Inappropriate images
- Offensive language

If a post is reported by **more than five users**, it will automatically be removed.

---

# Student Discussion Spaces

The application includes **discussion spaces** where students can share ideas and communicate.

Discussion areas are organized into categories.

### Example Categories

- Programming
- Placements
- Internships
- Study Materials
- Hackathons
- Events
- Clubs
- General Discussion

Students can join categories and participate in discussions.

Students can:

- Ask questions
- Share knowledge
- Post resources
- Discuss ideas

This creates a **collaborative learning environment within the university.**

---

# Technology Stack

## Frontend

- React.js
- Next.js
- Tailwind CSS

Pages include:

- Login Page
- Student Dashboard
- Lost & Found Page
- Marketplace Page
- Canteen Menu Page
- Campus Map Page
- Clubs Page
- Placement Experiences Page
- Discussion Forum
- Notifications Page
- AI Tools Page
- Public Portal Pages

Frontend communicates with the backend using **REST APIs**.

---

## Backend

Technologies used:

- Node.js
- Express.js

Backend responsibilities:

- User authentication
- API creation
- Database management
- Image uploads
- Notification system
- AI integration

### Example API Endpoints

POST /login  
GET /lost-items  
POST /lost-items  
GET /marketplace  
POST /marketplace  
GET /menu  
POST /order  
GET /notifications

---