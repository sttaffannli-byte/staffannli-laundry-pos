# LaundryPro POS + Online Website

A touch-friendly laundry cashier, order tracking, admin dashboard, customer database, reports, and online booking website preview.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, connect the repository.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

## Included

- Tablet-friendly cashier POS
- Weight and per-item services
- Cash, GCash, Maya, and bank transfer
- Reference number field
- Order progress workflow
- Customer database
- Sales summary
- Online website and booking form preview
- Local browser data storage
- Responsive desktop/tablet/mobile layout

## Recommended production upgrade

Connect the UI to Supabase/PostgreSQL or Cloudflare D1, add authentication, receipt printing, SMS, real online payments, and multi-branch support.
