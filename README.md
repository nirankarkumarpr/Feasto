# Feasto – Food Delivery Platform

Feasto is a full-stack food delivery web application built using the MERN stack.
It allows users to browse menus, manage their cart, place orders, and make secure payments.
The platform supports role-based access for Admin, User, and Delivery personnel, ensuring secure and organized order management.

The application follows MVC architecture and provides a responsive user interface built with React and Tailwind CSS.

---

## Features

* User authentication using JWT (Login and Registration)
* Role-based authorization (Admin, User, Delivery Boy)
* Browse food menu and add items to cart
* Secure online payment integration using Razorpay
* Real-time order tracking with multiple status stages
* Admin dashboard for order and menu management
* Delivery dashboard for updating delivery status
* Protected routes for secure navigation
* Image upload and storage using Cloudinary
* Responsive and modern UI using Tailwind CSS
* Global state management using React Context API

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router DOM
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* MVC Architecture
* Cloudinary (Image Upload and Storage)

### Payment Gateway

* Razorpay

---

## User Roles

The application supports three roles:

* User – Browse menu, add items to cart, place orders
* Admin – Manage menu items and monitor orders
* Delivery Boy – Update delivery status

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
* Real-time notifications
* Dark mode UI
* Admin analytics dashboard
