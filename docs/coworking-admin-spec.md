
# Technical Specifications - SP01

I) We modified the GET API under the route /api/coworking/operating_hours in order to correct an existing mistake in the fastAPI routing. The GET api, when called from the frontend service, would link to /api/coworking/operating-hours instead of the correct link above, creating 404 error. With this modification, we can add new hours from the frontend service properly. The model was unchanged as a result of these updates, as the data was still sent in the same format as before.

II) We chose to use the existing entity format for storing operating hours, which has the following format:
  Id - Unique identifier for the set of hours
  Start - Start date and time for hours, stored as dateTime object
  End - End date and time for hours, stored as dateTime object
	With future development, we will continue to use this format, as it encapsulates all of the necessary information we need to view, create, edit, and delete operating hours. 


III) We chose to use a start and end time dropdown list over having chips for each day of the week because the old design choice had an logic issue where the user would be able to select a date range with days of the week that didn’t match. We also opted to use a WritableSignal instead of a standard array because doing so allows us to take advantage of Angular’s signal system, enabling the operatingHoursList to be updated reactively.

IV) The files we edited/added include: 
  1. frontend/src/app/coworking/coworking-admin/coworking-admin.component.css
    a. Added classes for styling the add hours submit button, and our date pickers.
  2. frontend/src/app/coworking/coworking-admin/coworking-admin.component.html
    b. This is where we structured the content of our new admin operating hours component using material UI. Includes a ngForm element that takes in a start and end date from user input, as well as a date picker element.
  3. frontend/src/app/coworking/coworking-admin/coworking-admin.component.ts
    c. This is where we defined the component methods that our frontend UI would call on startup and on button presses. For startup, we created a fetchOperatingHours() method that returns the existing operating hours in the database as an array, displaying them on the UI. This method is also called after hours are submitted, so that the view updates dynamically upon hour submission. We also created a createOperatingHours() in order to gather the user data inputted through the view, and pass that data to the existing fastAPI architecture (using a POST call) to add to the operating hours database. We also included data validation to ensure that the inputted start and end date are a valid time interval. Finally, we created a resetOperatingHours() function in order to clear the user inputs in the dateTime picker once the hours were successfully submitted, 
  4. frontend/src/app/coworking/coworking.service.ts
    d. In the coworking module file, we made a small addition to the ng directive in order to include our page as a component that imports all of the material UI components. This allowed us to utilize angular’s material design elements in our HTML file.
  5. frontend/src/app/coworking/coworking.module.ts
    e. We made a modification to the coworking service file to increase the time intervals which were returned from the database when a GET operation was performed. This allowed the webpage to display existing hours up to 2 months into the future, rather than one week. 
