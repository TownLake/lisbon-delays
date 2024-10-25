import './globals.css'

export const metadata = {
  title: 'Lisb-On Time Rates',
  description: 'Airport delay trends at LIS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}