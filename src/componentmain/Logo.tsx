/**
 * Logo dùng chung — giống hệt logo trong Header gốc (ảnh logo + chữ FIRE / TECH).
 */
const LOGO_SRC = 'https://pccctrucbinh.vn/wp-content/themes/truc-binh-pccc/assets/img/logo.png';

const Logo = ({ small = false, showText = true }: { small?: boolean; showText?: boolean; size?: number }) => (
    <span className="inline-flex items-center select-none">
        <img src={LOGO_SRC} className={`${small ? 'h-8' : 'h-10'} object-contain`} alt="Logo PCCC" />
        {showText && (
            <span className="mx-2 tracking-widest font-bold flex items-center">
                <span className={`text-[#FF3333] ${small ? 'text-xl' : 'text-2xl'} -mt-0.5 mr-1 drop-shadow-sm`}>FIRE</span>
                <span className={`text-[#3399FF] ${small ? 'text-xl' : 'text-2xl'} drop-shadow-sm`}>TECH</span>
            </span>
        )}
    </span>
);

export default Logo;
