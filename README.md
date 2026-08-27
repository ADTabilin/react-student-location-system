# React Student Location System

A React application for registering students, geocoding their addresses, displaying their locations with React Leaflet, and managing registered records.

## Requirements covered

- Student registration form
- Form validation
- Address geocoding with OpenStreetMap Nominatim
- React Leaflet map
- One marker per registered student
- Marker popups with student information
- React state array for student records
- Automatic student table updates
- Delete functionality
- React Bootstrap components
- Tailwind CSS layout/styling
- Responsive interface
- Vercel-ready Vite project

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Upload/push this project to GitHub.
2. Open Vercel and import the repository.
3. Keep the default Vite settings.
4. Deploy.
5. Copy the generated Vercel URL for submission.

## Important

The address search uses the public OpenStreetMap Nominatim service. Use complete addresses such as:

`National University MOA, Pasay City, Philippines`

Because this is a frontend-only activity, the student array is stored in React state and will reset when the page is refreshed.
