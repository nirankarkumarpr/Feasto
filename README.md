# Feasto – Food Delivery Platform

Feasto is a full-stack food delivery web application built using the MERN stack.
It allows users to browse menus, manage their cart, place orders, and make secure payments.
The platform supports role-based access for Admin, User, and Delivery personnel, ensuring secure and organized order management.

The application follows MVC architecture and provides a responsive user interface built with React and Tailwind CSS.

---

## Features

* User authentication and role-based authorization (Admin, User, Delivery Boy)
* Browse food menu, manage cart, and place orders
* Secure online payment integration using Razorpay
* Interactive map-based delivery location selection with address search
* Real-time order tracking with live delivery location updates
* Automatic geolocation and route visualization with distance/ETA calculation
* Socket.io powered real-time notifications for all order updates
* Admin dashboard with menu management and revenue tracking
* Delivery dashboard with commission-based earnings system
* Customer order cancellation and cart notifications
* Image upload and storage using Cloudinary
* Responsive UI with Tailwind CSS and Context API state management

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router DOM
* Axios
* Context API
* Socket.io Client
* Leaflet (Interactive Maps)
* Leaflet Routing Machine (Route Visualization)
* React Hot Toast (Notifications)

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* MVC Architecture
* Socket.io (Real-time Communication)
* Cloudinary (Image Upload and Storage)

### Payment Gateway

* Razorpay

---

## User Roles

The application supports three roles:

* User – Browse menu, add items to cart, place orders, track live delivery, cancel orders
* Admin – Manage menu items, monitor orders, track live delivery, view total revenue 
* Delivery Boy – Accept orders, update delivery status, automatic location sharing, view total earnings

---

## Order Status Flow

The system supports multiple order stages:

* Pending
* Confirmed
* Preparing
* Out for Delivery
* Delivered
* Cancelled

---

## Future Improvements

* Email notifications
* Order history analytics
* SMS notifications for order updates
* Dark mode UI
* Admin analytics dashboard with charts
* Customer ratings and reviews
* Multi-restaurant support
* Promo codes and discounts