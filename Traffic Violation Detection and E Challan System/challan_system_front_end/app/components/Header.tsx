import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-primary text-text shadow-md w-full">
            <div className="container mx-auto flex items-center justify-between flex-nowrap px-2">

                {/* Left: Logo + Title */}
                <div className="flex items-center space-x-2 min-w-0">
                    <Image
                        src="/images/ChallanLogo.png"
                        alt="E-Challan"
                        width={60}
                        height={60}
                        className="object-contain flex-shrink-0"
                    />

                    <h1 className="font-heading font-bold text-sm sm:text-xl md:text-3xl truncate">
                        E-Challan System
                    </h1>
                </div>

                {/* Desktop Contact Info */}
                <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                        <Image
                            src="/images/phone-icon.png"
                            alt="Phone"
                            width={20}
                            height={20}
                        />
                        <a href="tel:+923000250425" className="text-sm lg:text-lg">
                            +92 300 0250 425
                        </a>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Image
                            src="/images/email-icon.png"
                            alt="Email"
                            width={20}
                            height={20}
                        />
                        <a href="mailto:itgprogaming42@gmail.com" className="text-sm lg:text-lg">
                            itgprogaming42@gmail.com
                        </a>
                    </div>
                </div>

                {/* Mobile Contact */}
                <div className="flex md:hidden items-center space-x-1 flex-shrink-0">
                    <span className="text-xs">+92 300 0250 425</span>
                </div>
            </div>
        </header>
    );
}