import './globals.css'

export const metadata = {
  title: 'Life Tracker',
  description: 'Personal life tracking application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
