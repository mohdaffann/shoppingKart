

function Header({ setPage, cartCount }: { setPage: any, cartCount: number }) {
    return (
        <header className="border-b bg-white shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <button
                    onClick={() => setPage('')}
                    className="text-2xl cursor-pointer font-bold text-slate-800"
                >
                    ShopKart
                </button>

                {/* Navigation */}
                <nav className="flex items-center gap-8">
                    <button
                        onClick={() => setPage('products')}
                        className=" cursor-pointer text-slate-600 transition hover:text-black"
                    >
                        Products
                    </button>

                    <button
                        onClick={() => setPage('cart')}
                        className="cursor-pointer relative text-slate-600 transition hover:text-black"
                    >
                        Cart
                        <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                            {cartCount}
                        </span>
                    </button>
                </nav>
            </div>
        </header>
    );
}

export default Header;