import logo from "../assets/ePustakalayNewLogo.png";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-slate-200">
      <div className="max-w-350 mx-auto px-8 grid grid-cols-4 gap-10 text-center text-sm">
        <div>
          <img 
            src={logo} 
            alt="ePustakalay Logo" 
            className="h-16 w-auto object-contain mx-auto mb-4"
          />

          <p className="text-gray-500 mt-5">
            Empowering intellectual exploration through the
            world's finest digital collection.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <div className="space-y-2 text-gray-500">
            <p>About Us</p>
            <p>Library Policy</p>
            <p>Reading Guides</p>
            <p>Contact Support</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Community</h4>
          <div className="space-y-2 text-gray-500">
            <p>Reader Forum</p>
            <p>Curator Program</p>
            <p>Affiliate Booksellers</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <div className="space-y-2 text-gray-500">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Accessibility</p>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto mt-12 pt-8 border-t text-center text-gray-500 text-sm">
        © 2026 ePustakalay Digital Curator. All rights reserved.
      </div>
    </footer>
  );
}