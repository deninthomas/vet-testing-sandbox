# TailWise Animal Welfare Sandbox: Deliberate Bugs Directory

This file contains the complete list of **50 deliberate functional, logical, validation, UI, database, security, and integration bugs** implemented in this workspace. Testers can use this catalog to verify their findings, build test cases, and write automated test scripts.

---

## 🛠️ Testing Environment Details
* **Local server**: Run `npm run dev` and navigate to `http://localhost:3000`.
* **Database**: Runs completely in-memory inside global server variables by default. To connect to a live MongoDB instance, create a `.env.local` file in the project root:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tailwise
  ```
* **Role Switcher**: Click **Show Panel** in the amber header banner to instantly toggle between user roles (Guest, User, Volunteer, Admin) without needing to log in. Click **Reset DB** to restore the mock data to defaults.

---

## 🐞 Bugs Directory

### 🌐 Core Layout, Navigation & Global Bugs (5 Bugs)
1. **Case-Sensitive Mobile Navigation (Adoption)**: In the mobile responsive menu, the *Adoption* link points to `/Adoption` (capitalized). On case-sensitive web servers, this causes a **404 page not found** error.
2. **Aggressive Logout Storage Wipe**: Clicking **Log Out** runs `localStorage.clear()` instead of removing only the `tailwise_user` session key, silently destroying all other saved preferences, dark mode states, and cached data.
3. **Implicit GPS Swap Bug (Database Layer)**: Submitting GPS coordinates swaps Latitude and Longitude values, shifting reported animals to the middle of the ocean.
4. **Theme Inversion Toggle Bug**: Activating dark mode styling applies light variables, and light mode applies dark variables.
5. **Footer Wiki Mismatched Link**: The Main Project course link in the footer points to the page for *21CA405* instead of the correct course code *21CA406*.

### 👤 User Registration, Login & Profile (10 Bugs)
6. **Registration Email Validation Bypass**: Users can register with invalid emails (e.g. `invalidpath` lacking `@` or domains).
7. **Blank Password Bypass**: The registration API permits creating active accounts with empty passwords.
8. **Mismatched Input IDs (Password Autofill Mismatch)**: The registration Email input has `id="password"`, confusing browser credential managers and saving email strings as passwords.
9. **Duplicate Email Case-Sensitivity Check**: The register check is case-sensitive, allowing `User@tailwise.org` and `user@tailwise.org` to register as duplicate accounts.
10. **Silent Password Truncation**: Registering a password longer than 8 characters silently truncates it to 8 characters without showing an error, preventing logins with the original password.
11. **Case-Insensitive Password Login**: Password check at login is case-insensitive (e.g. `USERPASSWORD` matches `userpassword`).
12. **Profile Display Field Swap**: The profile settings page swaps the email and phone number inputs when displaying them.
13. **Secret Rescuer Backdoor Parameter**: Appending `?makeRescuer=true` to `/profile` elevates any guest/user account to a "Volunteer" role without admin permission.
14. **Vulnerable DOM Password Credential Leak**: The profile page leaks the plain password hash in a hidden input element (`id="sensitive_hash"`) inside the HTML body.
15. **Profile Empty Name Update**: Profile allows saving blank names, resulting in anonymous profiles.

### 🚨 Incident Reporting & Volunteer Dispatch (10 Bugs)
16. **Missing Location Address Check**: The incident reporting form allows submissions without a location address, causing empty locations in lists.
17. **Corrupted Large Image Upload**: Uploading an image larger than 2MB saves a corrupted string, resulting in broken image icons in dispatches.
18. **Dispatcher Off-By-One Case Resolution**: Clicking "Mark as Resolved" on a dispatch in the Volunteer Portal resolves the *next* dispatch card in the array instead of the clicked one.
19. **Reporter Phone Length Bypass**: Incident reports accept phone numbers that are only 1 digit long.
20. **Dispatch Feed Case-Sensitive Search**: Search filter in the Volunteer Portal is case-sensitive, meaning searching `dog` won't match `Dog`.
21. **Space-Filter Search Typo**: Searching dispatches with a space matches nothing due to an unhandled whitespace trim error.
22. **Auto-Capitalization Filter Mismatch**: Entering animal type as "dog" (lowercase) blocks it from showing under standard "Dog" filters.
23. **Double Click Report Submission duplicate**: Clicking submit twice quickly creates twin reports with different IDs.
24. **Volunteer Dashboard Index Loop Leak**: Resolving the last item in the list loops back and resolves the first item due to a modulo index calculation bug.
25. **Missing Latitude/Longitude bounds validation**: The form accepts impossible coordinates (e.g. latitude: `500`).

### 🐕 Orphaned Pet Adoption Portal (10 Bugs)
26. **Adoption Application Past Date Check**: Adoption forms allow choosing past dates (e.g. yesterday, or 1999) for adoption.
27. **Adoption Status Sync Crash (500 Error)**: Already adopted animals are still displayed in the public catalog, and attempting to adopt them crashes the server with a 500 stack trace.
28. **Adoption Search Whitespace Crash**: Typing a single space in the search bar and hitting enter crashes the list filtering.
29. **Breed Name Search Case-Sensitivity**: Breed searches are case-sensitive (e.g. searching `retriever` won't match `Retriever`).
30. **Alphabetical Age Sort Bug**: Sorting pets by "Age" sorts them alphabetically rather than chronologically (e.g. "10 months" sorted before "2 years").
31. **Phone Validation Letters Bypass**: Applicant contact number allows letters (e.g. "CALL ME NOW").
32. **Double Adoption Matching Race**: Multiple users can apply and simultaneously adopt the same pet.
33. **Animal Age Input Mismatch**: Creating animals in the admin portal ignores the custom age field and uses default values.
34. **Search query string injection**: Search queries can inject special characters, altering list display.
35. **Adopted Animal Action Button Active**: Adopted animals display an active "Adopt Now" button rather than a disabled "Adopted" status button.

### 💰 Donations & Contribution Logs (5 Bugs)
36. **Preset $50 Concatenation Bug**: Selecting the `$50` preset adds a `"0"` string concatenation, charging the donor **$500** on submit.
37. **Date rendering NaN**: The date column in the Contribution History table displays as `NaN/NaN/NaN`.
38. **Negative Donation Amount**: The donation form accepts negative numbers (e.g., `-100`), which decreases the global donation total in the stats.
39. **Donation Cause Name Mismatch**: Selecting "General Welfare Fund" in the dropdown saves in the database as "General Fund", creating search mismatches.
40. **XSS Vulnerability on Donor Name**: The donor name cell renders raw HTML via `dangerouslySetInnerHTML`, allowing HTML/Script injection.

### 🛒 Pet Shop Online Shopping (7 Bugs)
41. **Negative Quantity Cart Checkout**: The cart accepts negative product quantities, resulting in negative sub-totals and checkouts.
42. **Product Case-Sensitive Search**: Product searches in the pet shop are case-sensitive.
43. **Double Add-to-Cart Price Overwrite**: Adding a product to the cart twice overwrites the product price with $0 in the cart total.
44. **Cart quantity zero deletion failure**: Setting product quantity in cart to `0` does not delete it, but keeps it in cart with a price of `$0`, allowing checkout of empty items.
45. **Product Stock Out-of-Stock bypass**: Purchasing more items than the available stock succeeds, driving the stock to negative numbers (e.g. stock: `-5`).
46. **Cart Promo Code Inversion**: Applying the promo code "SAVE10" increases the price by 10% instead of discounting it.
47. **Decimal Rounding Mismatch**: Total price shows raw floats with rounding issues (e.g., `$19.99 * 3 = $59.96999999999999` in raw display text).

### 🏥 Veterinary Clinics Directory (5 Bugs)
48. **Suburbs City Filter Crash**: Selecting the "Suburbs" city filter (which has 0 hospitals) crashes the page rendering with a `TypeError: Cannot read properties of undefined (reading 'name')`.
49. **Clinic Rating Inversion**: Clinics are sorted by rating, but it sorts from lowest rating to highest rating.
50. **Phone Dial Prefix Typo**: Clicking the phone number link (e.g. `tel:222-333-4444`) has a typo `tel:2223334444a` (appends a letter at the end), which prevents mobile dialers from dialing.
51. **Admin Dashboard User Role Target Mismatch**: When the admin updates a user's role from the user management panel, the server API has a bug where it always modifies the role of the first user in the list (index 0) instead of the selected user.
52. **Veterinary Appointment Target Clinic Swap**: Booking an appointment at any veterinary clinic ignores the selected clinic ID and always books the appointment with the first clinic in the directory list ("City Animal Hospital").

