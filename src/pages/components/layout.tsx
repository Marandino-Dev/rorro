import Footer from "../api/components/footer"
import Navbar from "../api/components/navbar"


export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
