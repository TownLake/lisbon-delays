import './globals.css'

export const metadata = {
  title: 'LIS-b-On Time',
  description: 'Lisbon Airport Delay Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}