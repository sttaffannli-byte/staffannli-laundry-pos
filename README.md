# Ate Anna's Laundry POS V2

A fresh Cloudflare-ready laundry POS starter with:

- Dashboard
- New Order and Orders
- Staff Annli
- Add/Edit/Delete staff
- Upload, change, compress, and remove staff profile photo
- Staff roles and status
- Attendance time in/time out
- Payroll-ready salary summary
- Responsive tablet/mobile layout
- Browser local storage for demo data

## Deploy to Cloudflare Pages

### Direct Upload
1. Extract this ZIP.
2. Open Cloudflare Dashboard.
3. Go to Workers & Pages.
4. Create application > Pages > Upload assets.
5. Upload the project folder contents (index.html, style.css, app.js).
6. Deploy.

No build command is required.

## Important
This first version saves data in the browser's localStorage. It is suitable for testing and UI development.
For production and multi-device synchronization, the next phase should connect to Cloudflare D1 and R2.

Default sample admin:
- Username: annli
- PIN: 1234
