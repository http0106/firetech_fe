import { Button } from 'antd'

/** KHÔNG CÒN DÙNG — route /products đã chuyển sang users/Products.tsx (bộ lọc hoạt động thật). */
const Product = () => {
    return (
        <>
            <div className="w-full grid grid-cols-4 gap-4 min-h-screen p-5 items-start">
                <div className="sticky top-20 h-[calc(100vh-96px)] overflow-hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-solid border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-[#3399CC]/10">


                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />


                    <div className="relative  py-5 pb-10 z-10 h-full overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 flex flex-col gap-5">

                        {/* Header Bộ lọc */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                                <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                                Bộ lọc tìm kiếm
                            </h3>
                            <Button type="text" size="small" className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-600">
                                Thiết lập lại
                            </Button>
                        </div>


                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                                Danh mục sản phẩm
                            </span>
                            <div className="flex flex-col gap-2.5">
                                {[
                                    { label: 'Bình chữa cháy (MFZ, CO2)', count: 42 },
                                    { label: 'Thiết bị báo cháy tự động', count: 28 },
                                    { label: 'Họng nước, Vòi & Lăng phun', count: 19 },
                                    { label: 'Đồ bảo hộ & Thoát hiểm', count: 35 },
                                    { label: 'Hệ thống đèn Exit & Sự cố', count: 14 }
                                ].map((cat, idx) => (
                                    <label key={idx} className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <span className="flex items-center gap-2">
                                            <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-red-600 focus:ring-red-500 bg-transparent" />
                                            {cat.label}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-slate-500">({cat.count})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-slate-800 my-0" />


                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                                Tiêu chuẩn & Kiểm định
                            </span>
                            <div className="flex flex-col gap-2.5">
                                {[
                                    'Tem kiểm định Bộ Công An',
                                    'Đầy đủ chứng chỉ CO/CQ',
                                    'Đạt chuẩn TCVN / ISO',
                                    'Hàng nhập khẩu chính hãng'
                                ].map((std, idx) => (
                                    <label key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-red-600 focus:ring-red-500 bg-transparent" />
                                        {std}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-slate-800 my-0" />


                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                                Khoảng giá
                            </span>
                            <div className="flex flex-col gap-2">
                                {[
                                    'Dưới 500.000đ',
                                    '500.000đ - 2.000.000đ',
                                    '2.000.000đ - 5.000.000đ',
                                    'Trên 5.000.000đ'
                                ].map((price, idx) => (
                                    <label key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <input type="radio" name="priceRange" className="border-gray-300 dark:border-slate-700 text-red-600 focus:ring-red-500 bg-transparent" />
                                        {price}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-slate-800 my-0" />

                        {/* 4. Thương hiệu / Xuất xứ */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                                Thương hiệu phổ biến
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                {['Dragon', 'Tomoken', 'Yamato', 'Hochiki', 'Nohmi', 'SRT'].map((brand, idx) => (
                                    <label key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300 cursor-pointer p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 text-red-600 focus:ring-red-500 bg-transparent" />
                                        {brand}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Nút Áp dụng bộ lọc */}
                        <div className="pt-2 pb-4 mb-5">
                            <Button type="primary" danger block size="large" className="font-semibold shadow-md shadow-red-500/20">
                                Áp dụng bộ lọc
                            </Button>
                        </div>

                    </div>
                </div>
                <div className="col-span-3  p-2  !border !border-solid !border-gray-200 dark:!border-white rounded-lg shadow-[#3399CC] shadow-sm">
                    {/* <ProductList row={3} /> */}
                </div>
            </div>

        </>



    )
}

export default Product