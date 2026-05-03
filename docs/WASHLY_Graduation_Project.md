# Abstract

With the rapid growth of digital transformation, users increasingly expect everyday services to be accessible online with minimal effort, immediate transparency, and zero waiting time. Traditional car wash services have long remained an offline, manual industry, requiring customers to physically visit locations without prior knowledge of queue lengths, service availability, or exact pricing. This often leads to frustratingly long waiting times, lack of service transparency, and difficulty in comparing available options or evaluating the quality of different providers.

This project presents WASHLY, a comprehensive web-based platform designed to digitally transform and simplify the process of discovering, comparing, and booking car wash services. The system enables users to browse an extensive directory of car wash centers, view deeply detailed information about available services, exact pricing structures, vehicle-specific surcharges, and operational hours. Furthermore, recognizing the demand for ultimate convenience, WASHLY also introduces a "Home Wash Service" feature, allowing users to request car detailing professionals to come directly to their specified location. The platform features filtering mechanisms based on geographic area, service type, and price range, empowering customers to make highly informed decisions. Users can confidently select their preferred service model, schedule a precise booking date and time slot, and finalize their reservation using simulated payment processes—accommodating both cash-on-arrival and digital card-based transactions.

Unlike initial prototypes limited to local client-side storage, the WASHLY platform has been engineered as a robust, full-stack application utilizing the modern MERN technology stack (MongoDB, Express.js, React, and Node.js). The frontend leverages React, Vite, and TailwindCSS to deliver a highly interactive, modern, and responsive user interface that performs seamlessly across desktop, tablet, and mobile devices. Concurrently, a powerful Node.js and Express backend serves RESTful APIs, securing user authentication via JSON Web Tokens (JWT), and persistently managing data—including users, centers, bookings, and home packages—within a MongoDB database. Additionally, an administrative dashboard is integrated to allow system managers to oversee users, manage center details, and monitor the lifecycle of bookings.

The main objective of this project is to demonstrate how sophisticated digital platforms can profoundly enhance service accessibility, user satisfaction, and operational oversight through a beautifully crafted interface and a structured, scalable backend workflow. Serving as a fully functional Minimum Viable Product (MVP), the system provides a robust architectural foundation perfectly positioned for future enterprise extensions, such as real-time messaging, GPS-based driver tracking, and integration with live global payment gateways.

---

# Chapter 1: Introduction

## 1.1 Background

In recent years, the acceleration of digital transformation has fundamentally reshaped how consumers interact with a wide array of services. Industries ranging from food delivery to real estate and personal transportation have been revolutionized by online platforms that prioritize customer convenience and operational efficiency. However, certain traditional sectors, notably the car wash and automotive detailing industry, have surprisingly lagged in adopting these digital convenience models. In the conventional workflow, customers are typically forced to physically drive to a car wash center, completely unaware of the current queue lengths or immediate service availability, often resulting in prolonged waiting times and significant frustration. 

Furthermore, the lack of an aggregated digital ecosystem makes it difficult for vehicle owners to compare the pricing, specific service inclusions, and overall quality of different centers prior to arrival. With the widespread global penetration of high-speed internet and the ubiquity of smart mobile devices, web applications have become a paramount tool for bridging this gap, improving customer experience, and simplifying access to everyday services. Online service platforms empower users to casually explore available services, read localized information, dynamically compare options, and secure bookings efficiently from the comfort of their homes or while on the go.

The WASHLY platform is introduced to directly address this technological gap, providing an intelligent, centralized digital solution that heavily streamlines the process of finding, scheduling, and managing car wash services. Through a meticulously designed, user-friendly frontend web interface powered by a robust backend architecture, customers can not only browse available physical car wash centers but also request specialized at-home services, establishing a new standard of convenience in automotive care.

## 1.2 Project Idea

The core concept behind this project is the creation of a comprehensive, end-to-end web-based car wash management and booking platform. WASHLY caters to modern consumer needs by offering two distinct service avenues: traditional center-based bookings and highly convenient Home Wash services. 

Through the platform, customers can engage with a rich directory of registered car wash centers. Each center profile is meticulously detailed, presenting critical information such as:
• Comprehensive lists of available cleaning and detailing services
• Transparent, tier-based pricing structures
• Dynamic surcharges dependent on vehicle types (e.g., Sedan, SUV, Truck, Van)
• Ratings and operational areas of expertise

Users can effortlessly browse these centers filtering them according to exact criteria such as geographic proximity, price affordability, or specific premium service offerings. Once a suitable center and service package is identified, the user smoothly transitions into an intuitive booking flow, selecting a preferred calendar date and available time slot. Alternatively, users opting for the Home Wash feature can select specialized home-service packages, input their precise residential address, and schedule a mobile detailing unit to visit them directly.

A unified booking and checkout interface simulates a modern e-commerce checkout experience, allowing users to designate payment preferences—either cash upon service completion or a simulated credit-card payment mechanism. After submission, the system generates a detailed confirmation itinerary summarizing the financial breakdown and logistical details. 

Beyond the customer-facing portal, the project idea deeply encompasses an Administrative interface. This ensures that platform operators have complete, centralized control to perform CRUD (Create, Read, Update, Delete) operations on car wash centers, oversee user accounts, and track all incoming and historical bookings, ensuring smooth business operations and dispute resolution.

## 1.3 Project Scope

While initially conceptualized as a pure frontend prototype, the scope of this project has significantly expanded to encompass the design, development, and deployment of a fully functioning, full-stack web application built upon the industry-standard MERN stack.

The primary goal of the system is to provide a complete, realistic, and highly scalable ecosystem demonstrating how users can digitally interact with service providers, and how administrators can manage a digital business securely and efficiently.

**System Architecture and Boundaries:**
The platform operates on a modernized client-server architecture:
• **Frontend:** Developed using React, React Router, Vite, and TailwindCSS, creating a dynamic Single Page Application (SPA) that delivers high-performance rendering and a highly responsive User Interface (UI).
• **Backend:** Built with Node.js and Express.js to construct secure, RESTful APIs capable of handling complex business logic, input validation, and secure data routing.
• **Database:** Powered by MongoDB, establishing a robust NoSQL schema to continuously store and manage collections of users, bookings, car centers, and home service packages.
• **Authentication:** Secured through JSON Web Tokens (JWT) and deeply integrated password hashing, ensuring that sensitive user data and administrative routes are rigorously protected.

The current system boundaries deliberately exclude third-party financial integrations (no real payment gateways like Stripe or PayPal are hooked up to live banks) and advanced real-time geospatial tracking (no live GPS maps for home service drivers). The payment interface is successfully simulated to complete the user journey without requiring real financial transactions.

**Core Functionalities:**
The application ambitiously provides the following comprehensive feature sets:

1. **User Authentication & Authorization:**
   Secure registration and login endpoints utilizing JWT to distinguish between standard consumers and system administrators, dictating interface permissions automatically.

2. **Browsing and Filtering Car Wash Centers:**
   Users can effortlessly consult a dynamically queried database of car wash centers, filtering through options based on explicit variables such as location and service cost.

3. **In-Depth Service Details and Dynamic Pricing:**
   Upon selecting a center, the user is presented with distinct service packages. The system strictly accounts for vehicle sizing, algorithmically adjusting final retail prices based on whether the user selects a Sedan, SUV, Truck, or Van.

4. **Home Wash Packages:**
   An exclusive feature allowing users to bypass centers entirely, bringing the car wash directly to their driveway with dedicated packages, date/time scheduling, and specific address inputs.

5. **Advanced Booking Workflow:**
   A seamless progression allowing users to lock in calendar dates, choose valid, system-generated time slots, insert optional vehicle notes, and cleanly review comprehensive pricing before financial commitment.

6. **Simulated Payment Gateway:**
   Users are presented with intuitive toggles to specify payment mechanisms (Digital Visa/Credit vs. Physical Cash), rounding out the consumer purchasing experience.

7. **Administrative Dashboard:**
   A protected, robust admin portal completely independent of the main user UI, granting power users the ability to deeply manage infrastructure: modifying center attributes, adjusting pricing metrics, banning/managing users, and altering booking statuses (e.g., Pending, Completed).

## 1.4 Business Problem

In today's fast-paced, highly digitized lifestyle, time is explicitly recognized as a premium asset. Yet, consumers routinely confront significant inefficiencies when seeking reliable, high-quality automotive care. The deeply entrenched, traditional approach requires customers to physically transport their vehicles to multiple car wash locations merely to discern pricing, gauge queue times, and determine service availability. This archaic methodology is fundamentally fraught with inefficiencies for both the supply and demand sides of the market.

From the consumer perspective, the most prominent issue is an extreme lack of transparency. Customers are rarely able to ascertain precise costs prior to arrival, nor are they aware of surcharges applied to larger vehicles like SUVs and vans until the point of sale. This persistent uncertainty breeds hesitation, erodes trust, and frequently culminates in dissatisfaction. Additionally, relying on non-digital systems means users cannot reliably determine if a center is fully booked, understaffed, or operating under delayed conditions, leading to notorious, unpredictable waiting times especially during weekend peak hours.

From the business operator perspective, the absence of a unified booking system results in chaotic peak periods followed by unproductive lulls. Without a central digital reservation and management system, operators struggle to forecast daily demand, efficiently allocate staff, or maintain a structured database of loyal clientele for future marketing.

**Impact of the Problem:**
These compounding challenges trigger numerous adverse outcomes, including:
• Substantial wasted time, fuel, and effort for customers.
• Severely diminished customer satisfaction and brand loyalty.
• Highly inefficient utilization of car wash facility bays and resources.
• Complete lack of centralized, actionable business data for operators.

**Proposed Solution:**
To dismantle these systemic issues, the WASHLY platform is introduced as a heavily integrated digital solution connecting consumers and service providers. It serves as an authoritative hub empowering users to browse detailed car wash centers, directly compare intricate services and pricing tables, and flawlessly simulate the booking process from remote environments. By explicitly offering dual solutions—locking in time-slots at physical locations to eradicate queues, or requesting premium Home Wash mobile deployment—the platform adapts dynamically to shifting consumer behaviors.

**Value of the Solution:**
By implementing WASHLY, the industry realistically transforms:
• Time previously wasted in idle queues is entirely reclaimed.
• Pricing and service transparency instills immediate consumer trust.
• Service operators gain a structured, predictable flow of scheduled bookings visible directly on a digital dashboard.
• The car washing industry is firmly modernized, mirroring the convenience seen in contemporary food and transit applications.

## 1.5 Project Objectives

The primary objective of this graduation project is to conceptualize, design, and engineer a full-stack, comprehensive web platform that modernizes the automotive care industry. It deliberately aims to demonstrate an end-to-end software development lifecycle, producing a scalable application that solves real-world workflow inefficiencies.

To attain this overarching mission, the project adheres to the following highly specific technical and functional objectives:

1. **Develop an Exceptional User Interface (UI/UX):**
   To leverage modern frontend frameworks, specifically React and TailwindCSS, to architect an interface that is visually stunning, deeply intuitive, and strictly accessible. The objective is to eliminate cognitive load, allowing users to effortlessly navigate services, pricing, and bookings.

2. **Implement Fully Responsive Design Architecture:**
   To guarantee that the application responds immaculately to variant screen resolutions. Whether rendering on a 4K desktop monitor, an iPad, or a compact mobile device, the platform must re-orient grids, flexboxes, and navigation elements flawlessly to capture mobile-first consumers.

3. **Engineer a Robust Backend API:**
   To abandon static local-storage limitations and actively build a highly dependable server-side ecosystem using Node.js and Express.js. This involves crafting RESTful endpoints to process, validate, and respond to asynchronous requests safely and rapidly.

4. **Ensure Comprehensive Data Persistence:**
   To successfully integrate a NoSQL database (MongoDB) establishing explicit, relational-like schemas for complex entities (Users, Centers, Bookings), guaranteeing that data remains consistent and retrievable across all client sessions indefinitely.

5. **Establish Secure Authentication Pathways:**
   To protect sensitive user data and restrict route logic utilizing robust JSON Web Tokens (JWT) and localized middleware. The objective highlights ensuring that consumers can only access their private booking histories, while explicitly designated Administrators gain total infrastructural oversight.

6. **Construct a Specialized Administrative Module:**
   To inject an Admin layer offering a dashboard that parses raw database metrics into readable lists, granting the capability for active business management directly through the web application.

7. **Demonstrate Next-Generation Digital Transformation:**
   To provide a tangible, academic yet commercial-grade prototype showing precisely how legacy industries can be optimized to respect consumer time, improve transparency, and digitize analog scheduling.

## 1.6 Related Work and Comparative Study

Within the contemporary digital landscape, various proprietary platforms and mobile applications have surfaced attempting to organize car repair, cleaning, and maintenance services. Established applications in overlapping markets (ranging from general digital marketplaces to localized, specific mobile apps) aim to integrate booking flows, live availability maps, and digital wallet integrations.

These dominant, existing platforms often rely heavily on deeply complex, highly monolithic infrastructures or expensive cloud microservices that require massive teams to maintain. They frequently suffer from bloated feature sets that overwhelm standard users, demanding heavy native app downloads and intrusive data permissions before a user can even view a basic price list. Furthermore, many existing products focus exclusively either on dispatching mobile cleaners (home service only) or mapping physical locations (directory only), rarely unifying both workflows seamlessly.

**Proposed System Comparison (WASHLY):**
The WASHLY system sharply distinguishes itself by focusing profoundly on an agile, unified web-based approach. By utilizing a Single Page Application (SPA) architecture, WASHLY dramatically reduces loading times and overhead, completely negating the requirement for customers to download a standalone application from an app store. 

By unifying both "In-Center Bookings" and "Home Wash Deployments" under a solitary, highly intuitive interface, WASHLY exceeds the utility of highly fragmented competitors. Technically, instead of relying on opaque, legacy monolithic backend systems, WASHLY champions the modern MERN stack. This ensures incredibly fast API transmission, non-blocking asynchronous data parsing via Node.js, and extreme UI flexibility through React's component-based virtual DOM.

While enterprise solutions feature live payment integrations (which carry substantial overhead regarding PCI compliance), WASHLY strategically adopts a simulated payment architecture for prototyping. This focuses the project directly heavily on mastering the core booking logic, state management, UI polish, and functional business requirements, leaving clearly defined, extensible hooks where real payment gateway modules can be effortlessly injected in the future.

## 1.7 Project Contribution

The definitive contribution of this graduation project resides in its successful manifestation of a full-stack, architecturally sound web application that actively upgrades the operational viability of the car washing sector. Transitioning far past theoretical design or elementary frontend mockups, this project delivers a secure, database-driven application acting as a viable blueprint for commercial digital transformation.

**Key Contributions Include:**

1. **Comprehensive Full-Stack Implementation:**
   The ultimate delivery of a sophisticated MERN stack application strongly demonstrates mastery across all modern development domains—connecting dynamic client-side visual layers securely to persistent server-side database collections.

2. **Unification of Service Paradigms:**
   A distinct contribution is the architectural flexibility to offer completely disparate service paths: the traditional physical venue booking logic juxtaposed with the logistical requirements of an at-home mobile detailing service. Both paths merge seamlessly into a solitary, conflict-free administrative dashboard.

3. **Exceptional UI/UX and Component Architecture:**
   By strictly utilizing atomic component hierarchies in React, complemented by the utility-first CSS framework Tailwind, the project contributes an interface that is simultaneously aesthetically premium and structurally maintainable. This guarantees an engaging, frictionless consumer journey from discovery to final checkout.

4. **Secure Digital Environments:**
   Implementing hardened JWT authentication protocols demonstrates a rigorous professional adherence to cybersecurity principles. The project ensures that unauthorized data mutation is thoroughly prevented, isolating regular consumer workflows from strict administrative controls.

5. **A Foundation for Future Enterprise Scalability:**
   Structurally, WASHLY is composed with deliberate foresight. Its modular API routing and decoupled React frontend mean that integrating future industry advancements—such as real-time WebSocket notifications, AI-based dynamic pricing to control peak demand, or enterprise-grade payment processing—can be achieved sequentially without shattering the existing foundational code.

Overall, the WASHLY project heavily contributes an educational yet deeply practical case study. It comprehensively illustrates the technical, aesthetic, and architectural discipline required to translate traditional, manual service industries into powerful, modern, user-centric software ecosystems.

---

# Chapter 3: System Analysis

## 3.1 Requirements Elicitation

The foundational phase of the WASHLY project was firmly rooted in comprehensive requirements elicitation. This phase was absolutely critical to ensure that system architecture and feature implementations were deeply aligned with the real-world operational realities of the car wash industry, rather than purely theoretical assumptions. To mitigate the risk of building an inadequate solution, a thorough pilot study was executed to extract concrete pain points from both the service providers (business operators) and the consumers (end-users).

**Data Collection Methods:**

1. **Strategic Interviews**
Extensive, semi-formal interviews were conducted with car wash center managers, floor supervisors, and mobile detailing professionals. These discussions were instrumental in demystifying the operational backend of car wash services. Key insights gathered included:
• The chaotic nature of manual ordering processes and phone-based bookings.
• Severe bottlenecks that spontaneously occur during weekends or peak seasonal hours.
• The absolute necessity for operators to have a secure, digital dashboard to accept, review, or decline incoming bookings.
• The logistical complexities of dispatching mobile workers to residential addresses for home wash services.

2. **Consumer Surveys**
A targeted digital survey was distributed to a demographic of frequent drivers to quantify user expectations. The survey metrics focused heavily on user friction points, revealing:
• Intense frustration regarding unpredictable waiting times.
• Widespread dissatisfaction with hidden fees, particularly unexpected surcharges applied to larger vehicles like SUVs and vans.
• A highly positive reception to the concept of pre-booking specific time slots via a mobile-friendly web application.

3. **Workflow Observation**
Physical and digital observations of competing scheduling pipelines (e.g., restaurant reservations or medical scheduling apps) were documented. This analysis directly highlighted that a simplistic, frontend-only prototype would be insufficient to solve real-world problems. The observation phase proved that data persistence (to prevent double-booking) and user authentication (to track booking history) were non-negotiable requirements.

**Impact on System Design:**
The findings from this elicitation phase triggered a massive architectural pivot. Initially conceived as a static frontend interface, the requirements proved that the business domain necessitated a full-stack MERN application. To solve the identified bottlenecks, the system had to inherently support dynamic database queries, live availability checking, structural user roles (Admin vs. Customer), and robust backend validation.

## 3.2 Key Business Needs Extracted from Pilot

Synthesizing the raw data from the elicitation phase generated a concrete hierarchy of business needs. These needs directly molded the functional specifications of the WASHLY platform:

1. **Efficient Service and Order Management (CRM Integration):**
Service providers explicitly require a centralized, secure digital hub to manage their operational flow. Rather than relying on paper logs, businesses need a dedicated administrative portal that tracks customer profiles, incoming service requests, and financial histories from initial booking to final service delivery.

2. **Absolute Pricing Transparency:**
Customers demand algorithmic price calculations prior to commitment. This business need dictates that the system must instantly calculate and display the final retail price—factoring in the base service cost alongside any dynamic surcharges dependent on the user’s selected vehicle class (Sedan, SUV, Truck, Van)—before payment selection.

3. **Multifaceted Service Discovery:**
Users fundamentally require highly optimized search and filtering mechanics. The platform must dynamically query the database so users can isolate centers based on hyper-specific criteria such as geographic proximity, tier-based pricing, or specific detailing features.

4. **Dual-Model Booking Flexibility:**
A major extracted need was the demographic split between users who prefer visiting a physical infrastructure versus those who demand ultimate convenience. The system inherently needs to support both traditional "In-Center Bookings" and location-based "Home Wash Packages" simultaneously without convoluting the user interface.

5. **Advanced Scheduling Integrity:**
The booking engine must be intelligent. Generating a visually appealing calendar is insufficient; the backend API must cross-reference selected time slots against existing database records to guarantee that service bays or home-service dispatchers are not disastrously double-booked.

6. **Simplified Payment Simulation:**
For the scope of the MVP, the platform needs an intuitive checkout terminal that accurately mimics a live e-commerce flow, granting users the psychological closure of selecting either "Cash on Arrival" or a secure "Digital Credit Card" transaction.

7. **Universal Platform Accessibility:**
Car emergencies or cleaning needs often arise unexpectedly while users are mobile. Therefore, it is a hard business requirement that the platform is rendered perfectly across all devices using deeply responsive design principles, ensuring no loss of functionality on mobile viewports.

## 3.3 Functional & Non-Functional Requirements

To successfully translate the identified business needs into technical development roadmaps, the requirements were rigorously categorized into Functional (what the system must concretely do) and Non-Functional (how the system must behave).

**Functional Requirements:**
• **Authentication & Authorization:** The system must securely register, authenticate, and manage users using cryptographically signed JSON Web Tokens (JWT), explicitly segregating regular customers from administrative users.
• **Dynamic Catalog Rendering:** The application must retrieve and instantly display active car wash centers and exclusive home-wash packages directly from the MongoDB database via RESTful Express routes.
• **Complex Filtering Logic:** The frontend interface must allow clients to dynamically parse and filter the database payload based on price, area, and service type without triggering excessive page reloads.
• **Intelligent Booking Engine:** The system must process variable inputs (Date, Time, Vehicle Size, Service Tier) and algorithmically generate an immutable booking record in the database.
• **Administrative Dashboard Management:** System operators must be granted secure access to a dedicated UI where they can perform complete CRUD actions (Create, Read, Update, Delete) on operational centers, user sanctions, and booking status mutations.

**Non-Functional Requirements:**
• **High Scalability & Concurrency:** Recognizing the potential for high-volume booking traffic, the backend must leverage Node.js’s asynchronous, non-blocking event loop to handle concurrent API requests without degradation.
• **Stringent Security Protocols:** All sensitive user paradigms, specifically user passwords, must be fiercely protected using robust hashing algorithms (e.g., bcrypt) before database insertion. Cross-Origin Resource Sharing (CORS) must be strictly configured.
• **Performance & Rendering Speed:** Operating as a React-based Single Page Application (SPA), the system must utilize the Virtual DOM to ensure near-instantaneous page transitions, maximizing user retention.
• **Adaptive Responsive Design:** Constructed using TailwindCSS, the UI must fluidly adapt its grid and flexbox methodologies across smartphones, tablets, and massive desktop monitors without UI fragmentation.

## 3.4 Data Requirements Identified

Transitioning away from rudimentary frontend state management, the full-stack nature of WASHLY requires a highly structured, relational-like NoSQL schema design utilizing MongoDB. This ensures data integrity, rapid querying, and logical relationships between disparate entities.

1. **User Identity & Security Data:**
To maintain personalized environments and security boundaries, the system must securely capture:
• Full Name and verified Contact Credentials (Email, Phone).
• Encrypted Password Hashes (completely abstracting raw passwords).
• Role-Based Access Control (RBAC) strings, specifically defining whether an entity is a 'User' or an 'Admin'.

2. **Complex Entity Data (Car Centers & Packages):**
The operational lifeblood of the platform requires deep object modeling for service providers:
• Center Metadata: Registration name, operational geographic area, and aggregated user ratings.
• Embedded Service Arrays: Nested documents detailing specific wash tiers (e.g., Basic, Premium), granular pricing configurations, and estimated time-to-completion metrics.
• Home Packages: Distinct collections outlining mobile-only services, base minimum pricing, and included automated features.

3. **Transactional Booking Data:**
To establish historical records and actionable operational logs, every booking interaction must generate a comprehensive database document containing:
• Relational ObjectIDs linking the exact Customer to the exact Center or Home Package.
• Temporal constraints (Validated Date and precise selected Time Slot).
• Vehicle Classification Data (triggering dynamic price surcharges).
• Live Status Enums (e.g., "Pending", "Completed", "Canceled") allowing admins to track order lifecycles.

## 3.5 User Roles Defined

In direct contrast to early theoretical prototypes, the WASHLY platform natively implements a rigorous, dual-role access control system. This ensures that the platform is not merely a static brochure, but rather a functional, secure business management tool.

1. **The Customer (End-User)**
The Customer role operates entirely within the public and protected user-facing sectors of the application. Upon securely logging into the system, Customers are strictly authorized to:
• Effortlessly browse, filter, and review the entire catalog of centers and home packages.
• Execute the complete booking workflow, confirming selected time slots and simulated payment methodologies.
• Access a dynamic, historically accurate summary of their specific past and upcoming bookings, ensuring complete transparency regarding their interaction with the platform. Customers are cryptographically firewalled, completely incapable of accessing another user's data or platform metrics.

2. **The Administrator (System Operator)**
The Administrator constitutes a highly privileged power-user role designed to manage the overarching business infrastructure of the platform. By navigating to deeply protected `/admin` routes, Administrators bypass the consumer interface and are presented with a tactical dashboard. Their responsibilities and permissions include:
• **CRM Monitoring:** Accessing macroscopic overviews of all platform traffic, total generated bookings, and overall system health.
• **Entity Management:** Modifying structural data regarding Car Wash centers (updating prices, tweaking available services, expanding operational areas) directly affecting the consumer-facing data instantly.
• **Booking Oversight:** The capacity to manually intervene in the booking lifecycle, systematically reviewing new requests and mutating their statuses (e.g., advancing a booking from "Pending" to "Completed").
• **User Moderation:** Overseeing the user database, verifying accounts, and mitigating disruptions to guarantee operational integrity across the platform.
