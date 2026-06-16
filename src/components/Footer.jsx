import logo from "../assets/ePustakalayNewLogo.png";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-slate-200 mb-16 md:mb-0">
      <div className="max-w-350 mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 text-center sm:text-left text-sm">
        <div className="sm:col-span-2 lg:col-span-1">
          <img 
            src={logo} 
            alt="ePustakalay Logo" 
            className="h-14 md:h-16 w-auto object-contain mx-auto sm:mx-0 mb-4"
          />

          <p className="text-gray-500 mt-3 md:mt-5 text-xs md:text-sm">
            Empowering intellectual exploration through the
            world's finest digital collection.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Resources</h4>
          <div className="space-y-2 text-gray-500 text-xs md:text-sm">
            <p>About Us</p>
            <p>Library Policy</p>
            <p>Reading Guides</p>
            <p>Contact Support</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Community</h4>
          <div className="space-y-2 text-gray-500 text-xs md:text-sm">
            <p>Reader Forum</p>
            <p>Curator Program</p>
            <p>Affiliate Booksellers</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Legal</h4>
          <div className="space-y-2 text-gray-500 text-xs md:text-sm">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Accessibility</p>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto mt-8 md:mt-12 pt-6 md:pt-8 border-t text-center text-gray-500 text-xs md:text-sm px-4">
        © 2026 ePustakalay Digital Curator. All rights reserved.
      </div>
    </footer>
  );
}