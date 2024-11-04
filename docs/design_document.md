# SP00 Design Document

## 1. Title & Team

**CSXL Open Hours Portal**

Developed by Team B6: Krish Patel, Milan Dutta, Vishaan Saxena, and Kensho Pilkey

## 2. Overview

The CSXL Open Hours Portal is a simple interface for admins to add/modify/delete the XL's open hours. Currently, XL staff have to manually update open hours through the site's JSON API which can be tedious and error-prone.

## 3. Key Personas

One key persona this feature would serve is XL coworking administrators who would update the hours based on their own availability, academic calendar, and upcoming events.

Another key persona impacted by this feature are regular students who use the XL. They want an accurate and frequently updated schedule to plan their week, especially around exams and project deadlines.

## 4. User Stories

As a CSXL coworking administrator, I want to manage operating hours through a simple and intuitive interface, so that the schedule accurately reflects each week's open hours.

As a student, I want to view an accurate version of future CSXL operating hours, so that I can plan my study time effectively.

As a CSXL coworking administrator, I want to be able to safely delete operating hours for rooms with existing reservations when no one has checked in, so that these rooms become available for students who will use them.

## 5. Wireframes / Mockups

<img width="864" alt="Screenshot-2024-11-03-at-5-03-42-PM" src="https://github.com/user-attachments/assets/570db7bf-b656-41d2-80b2-d016d7cbbb1f">

[Figma Link](https://www.figma.com/design/MXWDMV9kwcRAP8GuvSUfaJ/SP00-Figma?node-id=11-1833&t=uRC0L9EcUH5pwUgX-1)

Displayed here shows the CSXL Open Hours Portal interface, where administrators can add new open hours by selecting start and end times, along with specifying days. The lower card lists upcoming open hours, with options to edit or delete each entry.

## 6. Technical Implementation Opportunities and Planning

1. The Open Hours Portal will extend the existing frontend, and will integrate directly with the operating_hours API's. Much of this extension and implementation of our code will be based on operating_hours_entity.py, operating_hours.py and some of the other files in the coworking directory. We will also use a similar implementation of admin access for our operating hours pages based on the existing one on the coworking page.

2. This feature will be based on a main component named Open Hours that will contain some underlying widgets and Material 3 components. The M3 components include a day picker filter, start time and end time picker chips, and buttons. We will create widgets for the open hours rows to simplify the design as well as for the Add Open hours card.

3. We won’t modify the existing Operating hours models in operating_hours.py and time_range.py. Instead, we'll add filtering functionality for days of the week.

4. We will use the /api/coworking/operating_hours endpoint with POST and GET requests, along with the /api/coworking/operating_hours/{id} with DELETE to manage operating hours.

5. One potential security concern could be non-admin users being able to access the CSXL Open Hours Portal. This functionality should be restricted to admin-level users only, as not everyone should be allowed to specify open hours. Along with this, students should only be able to view operating hours without the ability to edit or access any reservation statistics.
