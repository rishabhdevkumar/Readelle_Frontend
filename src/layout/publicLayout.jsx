import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pb-16 lg:pb-0">
        {children}
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}