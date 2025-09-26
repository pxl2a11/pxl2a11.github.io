// 33js/apps/periodicTable.js

// --- Данные элементов таблицы Менделеева (ПОЛНАЯ ВЕРСИЯ) ---
const elements = [
    { "name": "Водород", "symbol": "H", "number": 1, "atomic_mass": 1.008, "category": "diatomic-nonmetal", "xpos": 1, "ypos": 1, "electron_configuration": "1s¹", "summary": "Самый лёгкий и распространённый элемент во Вселенной. Играет ключевую роль в звёздах и воде." },
    { "name": "Гелий", "symbol": "He", "number": 2, "atomic_mass": 4.002602, "category": "noble-gas", "xpos": 18, "ypos": 1, "electron_configuration": "1s²", "summary": "Инертный газ, второй по распространённости во Вселенной. Используется в воздушных шарах и криогенике." },
    { "name": "Литий", "symbol": "Li", "number": 3, "atomic_mass": 6.94, "category": "alkali-metal", "xpos": 1, "ypos": 2, "electron_configuration": "[He] 2s¹", "summary": "Лёгкий, мягкий, серебристо-белый щелочной металл. Широко используется в аккумуляторах." },
    { "name": "Бериллий", "symbol": "Be", "number": 4, "atomic_mass": 9.0121831, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 2, "electron_configuration": "[He] 2s²", "summary": "Лёгкий, но прочный щелочноземельный металл. Применяется в аэрокосмической промышленности и рентгеновской технике." },
    { "name": "Бор", "symbol": "B", "number": 5, "atomic_mass": 10.81, "category": "metalloid", "xpos": 13, "ypos": 2, "electron_configuration": "[He] 2s² 2p¹", "summary": "Полуметалл, существующий во множестве аллотропных модификаций. Используется в полупроводниках и как компонент боросиликатного стекла." },
    { "name": "Углерод", "symbol": "C", "number": 6, "atomic_mass": 12.011, "category": "polyatomic-nonmetal", "xpos": 14, "ypos": 2, "electron_configuration": "[He] 2s² 2p²", "summary": "Основа всей органической жизни на Земле. Существует в формах алмаза, графита и графена." },
    { "name": "Азот", "symbol": "N", "number": 7, "atomic_mass": 14.007, "category": "diatomic-nonmetal", "xpos": 15, "ypos": 2, "electron_configuration": "[He] 2s² 2p³", "summary": "Основной компонент земной атмосферы (около 78%). Важен для всех живых организмов." },
    { "name": "Кислород", "symbol": "O", "number": 8, "atomic_mass": 15.999, "category": "diatomic-nonmetal", "xpos": 16, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁴", "summary": "Высокореактивный неметалл, необходимый для дыхания большинства живых организмов." },
    { "name": "Фтор", "symbol": "F", "number": 9, "atomic_mass": 18.998403163, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁵", "summary": "Самый электроотрицательный и химически активный элемент. Галоген, используется в производстве тефлона." },
    { "name": "Неон", "symbol": "Ne", "number": 10, "atomic_mass": 20.1797, "category": "noble-gas", "xpos": 18, "ypos": 2, "electron_configuration": "[He] 2s² 2p⁶", "summary": "Инертный газ, известный своим ярким красно-оранжевым свечением в газоразрядных лампах." },
    { "name": "Натрий", "symbol": "Na", "number": 11, "atomic_mass": 22.98976928, "category": "alkali-metal", "xpos": 1, "ypos": 3, "electron_configuration": "[Ne] 3s¹", "summary": "Мягкий, серебристо-белый щелочной металл. Важен для функционирования нервной системы." },
    { "name": "Магний", "symbol": "Mg", "number": 12, "atomic_mass": 24.305, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 3, "electron_configuration": "[Ne] 3s²", "summary": "Лёгкий и прочный щелочноземельный металл. Используется в сплавах и важен для фотосинтеза (входит в состав хлорофилла)." },
    { "name": "Алюминий", "symbol": "Al", "number": 13, "atomic_mass": 26.9815385, "category": "post-transition-metal", "xpos": 13, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p¹", "summary": "Лёгкий, устойчивый к коррозии металл. Широко используется в авиации, строительстве и производстве упаковки." },
    { "name": "Кремний", "symbol": "Si", "number": 14, "atomic_mass": 28.085, "category": "metalloid", "xpos": 14, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p²", "summary": "Полуметалл, основа современной электроники и полупроводниковой промышленности." },
    { "name": "Фосфор", "symbol": "P", "number": 15, "atomic_mass": 30.973762, "category": "polyatomic-nonmetal", "xpos": 15, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p³", "summary": "Высокореактивный неметалл, ключевой элемент в ДНК, РНК и АТФ. Используется в удобрениях и спичках." },
    { "name": "Сера", "symbol": "S", "number": 16, "atomic_mass": 32.06, "category": "polyatomic-nonmetal", "xpos": 16, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁴", "summary": "Неметалл, известный своим характерным запахом в соединениях. Используется в производстве серной кислоты и вулканизации резины." },
    { "name": "Хлор", "symbol": "Cl", "number": 17, "atomic_mass": 35.45, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁵", "summary": "Реактивный галоген. Применяется для дезинфекции воды и как отбеливатель." },
    { "name": "Аргон", "symbol": "Ar", "number": 18, "atomic_mass": 39.948, "category": "noble-gas", "xpos": 18, "ypos": 3, "electron_configuration": "[Ne] 3s² 3p⁶", "summary": "Инертный газ, третий по содержанию в атмосфере Земли. Используется в сварке и лампах накаливания." },
    { "name": "Калий", "symbol": "K", "number": 19, "atomic_mass": 39.0983, "category": "alkali-metal", "xpos": 1, "ypos": 4, "electron_configuration": "[Ar] 4s¹", "summary": "Мягкий щелочной металл, бурно реагирует с водой. Важен для жизнедеятельности клеток, особенно нервных." },
    { "name": "Кальций", "symbol": "Ca", "number": 20, "atomic_mass": 40.078, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 4, "electron_configuration": "[Ar] 4s²", "summary": "Щелочноземельный металл, основной компонент костей, зубов и раковин. Используется в строительстве (цемент, гипс)." },
    { "name": "Скандий", "symbol": "Sc", "number": 21, "atomic_mass": 44.955908, "category": "transition-metal", "xpos": 3, "ypos": 4, "electron_configuration": "[Ar] 3d¹ 4s²", "summary": "Редкоземельный переходный металл. Используется в высокопрочных сплавах для аэрокосмической техники." },
    { "name": "Титан", "symbol": "Ti", "number": 22, "atomic_mass": 47.867, "category": "transition-metal", "xpos": 4, "ypos": 4, "electron_configuration": "[Ar] 3d² 4s²", "summary": "Лёгкий, прочный, коррозионностойкий металл. Применяется в авиации, медицине (импланты) и химической промышленности." },
    { "name": "Ванадий", "symbol": "V", "number": 23, "atomic_mass": 50.9415, "category": "transition-metal", "xpos": 5, "ypos": 4, "electron_configuration": "[Ar] 3d³ 4s²", "summary": "Твёрдый, ковкий переходный металл. Используется для легирования стали, придавая ей прочность и жаростойкость." },
    { "name": "Хром", "symbol": "Cr", "number": 24, "atomic_mass": 51.9961, "category": "transition-metal", "xpos": 6, "ypos": 4, "electron_configuration": "[Ar] 3d⁵ 4s¹", "summary": "Твёрдый, блестящий металл, устойчивый к коррозии. Применяется для создания нержавеющей стали и декоративных покрытий." },
    { "name": "Марганец", "symbol": "Mn", "number": 25, "atomic_mass": 54.938044, "category": "transition-metal", "xpos": 7, "ypos": 4, "electron_configuration": "[Ar] 3d⁵ 4s²", "summary": "Твёрдый, хрупкий металл. Важнейший компонент при производстве стали, удаляет из неё кислород и серу." },
    { "name": "Железо", "symbol": "Fe", "number": 26, "atomic_mass": 55.845, "category": "transition-metal", "xpos": 8, "ypos": 4, "electron_configuration": "[Ar] 3d⁶ 4s²", "summary": "Самый распространённый металл в земной коре и основа современной металлургии. Главный компонент стали и чугуна." },
    { "name": "Кобальт", "symbol": "Co", "number": 27, "atomic_mass": 58.933194, "category": "transition-metal", "xpos": 9, "ypos": 4, "electron_configuration": "[Ar] 3d⁷ 4s²", "summary": "Твёрдый, серебристо-белый металл с синеватым оттенком. Используется в сверхпрочных сплавах и для создания синих пигментов." },
    { "name": "Никель", "symbol": "Ni", "number": 28, "atomic_mass": 58.6934, "category": "transition-metal", "xpos": 10, "ypos": 4, "electron_configuration": "[Ar] 3d⁸ 4s²", "summary": "Твёрдый, ковкий металл. Применяется для создания коррозионностойких покрытий, нержавеющей стали и аккумуляторов." },
    { "name": "Медь", "symbol": "Cu", "number": 29, "atomic_mass": 63.546, "category": "transition-metal", "xpos": 11, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s¹", "summary": "Пластичный металл с характерным красноватым цветом и высокой электропроводностью. Широко используется в электротехнике." },
    { "name": "Цинк", "symbol": "Zn", "number": 30, "atomic_mass": 65.38, "category": "transition-metal", "xpos": 12, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s²", "summary": "Металл, используемый для защиты стали от коррозии (оцинковка). Важен для многих ферментов в организме." },
    { "name": "Галлий", "symbol": "Ga", "number": 31, "atomic_mass": 69.723, "category": "post-transition-metal", "xpos": 13, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p¹", "summary": "Мягкий серебристый металл, который плавится при температуре человеческого тела. Используется в полупроводниках." },
    { "name": "Германий", "symbol": "Ge", "number": 32, "atomic_mass": 72.63, "category": "metalloid", "xpos": 14, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p²", "summary": "Хрупкий полуметалл. Применяется в оптоволоконной оптике, инфракрасных технологиях и электронике." },
    { "name": "Мышьяк", "symbol": "As", "number": 33, "atomic_mass": 74.921595, "category": "metalloid", "xpos": 15, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p³", "summary": "Известный ядовитый полуметалл. Используется в полупроводниках и для легирования свинца." },
    { "name": "Селен", "symbol": "Se", "number": 34, "atomic_mass": 78.971, "category": "polyatomic-nonmetal", "xpos": 16, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p⁴", "summary": "Неметалл, обладающий фотопроводимостью. Важный микроэлемент для человека, используется в фотоэлементах." },
    { "name": "Бром", "symbol": "Br", "number": 35, "atomic_mass": 79.904, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p⁵", "summary": "Единственный неметалл, находящийся в жидком состоянии при комнатной температуре. Используется в антипиренах." },
    { "name": "Криптон", "symbol": "Kr", "number": 36, "atomic_mass": 83.798, "category": "noble-gas", "xpos": 18, "ypos": 4, "electron_configuration": "[Ar] 3d¹⁰ 4s² 4p⁶", "summary": "Инертный газ, используется в осветительных приборах и лазерах." },
    { "name": "Рубидий", "symbol": "Rb", "number": 37, "atomic_mass": 85.4678, "category": "alkali-metal", "xpos": 1, "ypos": 5, "electron_configuration": "[Kr] 5s¹", "summary": "Мягкий, высокореактивный щелочной металл. Используется в атомных часах." },
    { "name": "Стронций", "symbol": "Sr", "number": 38, "atomic_mass": 87.62, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 5, "electron_configuration": "[Kr] 5s²", "summary": "Мягкий, серебристо-белый щелочноземельный металл. Соединения стронция придают фейерверкам красный цвет." },
    { "name": "Иттрий", "symbol": "Y", "number": 39, "atomic_mass": 88.90584, "category": "transition-metal", "xpos": 3, "ypos": 5, "electron_configuration": "[Kr] 4d¹ 5s²", "summary": "Химически схож с лантаноидами. Используется в производстве люминофоров для экранов и светодиодов." },
    { "name": "Цирконий", "symbol": "Zr", "number": 40, "atomic_mass": 91.224, "category": "transition-metal", "xpos": 4, "ypos": 5, "electron_configuration": "[Kr] 4d² 5s²", "summary": "Коррозионностойкий металл, применяется в ядерной энергетике и для создания сверхпрочной керамики." },
    { "name": "Ниобий", "symbol": "Nb", "number": 41, "atomic_mass": 92.90637, "category": "transition-metal", "xpos": 5, "ypos": 5, "electron_configuration": "[Kr] 4d⁴ 5s¹", "summary": "Пластичный, тугоплавкий металл. Используется в сверхпроводящих магнитах и жаропрочных сплавах." },
    { "name": "Молибден", "symbol": "Mo", "number": 42, "atomic_mass": 95.95, "category": "transition-metal", "xpos": 6, "ypos": 5, "electron_configuration": "[Kr] 4d⁵ 5s¹", "summary": "Тугоплавкий металл, используется для легирования стали, повышая её прочность при высоких температурах." },
    { "name": "Технеций", "symbol": "Tc", "number": 43, "atomic_mass": 98, "category": "transition-metal", "xpos": 7, "ypos": 5, "electron_configuration": "[Kr] 4d⁵ 5s²", "summary": "Самый лёгкий радиоактивный элемент, не имеющий стабильных изотопов. Используется в ядерной медицине." },
    { "name": "Рутений", "symbol": "Ru", "number": 44, "atomic_mass": 101.07, "category": "transition-metal", "xpos": 8, "ypos": 5, "electron_configuration": "[Kr] 4d⁷ 5s¹", "summary": "Редкий металл платиновой группы. Используется как катализатор и в износостойких электрических контактах." },
    { "name": "Родий", "symbol": "Rh", "number": 45, "atomic_mass": 102.9055, "category": "transition-metal", "xpos": 9, "ypos": 5, "electron_configuration": "[Kr] 4d⁸ 5s¹", "summary": "Благородный металл платиновой группы. Основное применение — катализаторы в автомобильных выхлопных системах." },
    { "name": "Палладий", "symbol": "Pd", "number": 46, "atomic_mass": 106.42, "category": "transition-metal", "xpos": 10, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰", "summary": "Редкий, блестящий серебристо-белый металл. Используется в катализаторах, электронике и ювелирном деле." },
    { "name": "Серебро", "symbol": "Ag", "number": 47, "atomic_mass": 107.8682, "category": "transition-metal", "xpos": 11, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s¹", "summary": "Благородный металл с самой высокой электро- и теплопроводностью. Используется в ювелирном деле, электронике и фотографии." },
    { "name": "Кадмий", "symbol": "Cd", "number": 48, "atomic_mass": 112.414, "category": "transition-metal", "xpos": 12, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s²", "summary": "Мягкий, ковкий, токсичный металл. Применяется в аккумуляторах и как компонент легкоплавких сплавов." },
    { "name": "Индий", "symbol": "In", "number": 49, "atomic_mass": 114.818, "category": "post-transition-metal", "xpos": 13, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p¹", "summary": "Очень мягкий металл. Оксид индия-олова используется для создания прозрачных токопроводящих покрытий для ЖК-экранов." },
    { "name": "Олово", "symbol": "Sn", "number": 50, "atomic_mass": 118.71, "category": "post-transition-metal", "xpos": 14, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p²", "summary": "Коррозионностойкий металл, используемый в припоях и для покрытия стали (белая жесть)." },
    { "name": "Сурьма", "symbol": "Sb", "number": 51, "atomic_mass": 121.76, "category": "metalloid", "xpos": 15, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p³", "summary": "Хрупкий полуметалл. Используется в сплавах для придания твёрдости и в антипиренах." },
    { "name": "Теллур", "symbol": "Te", "number": 52, "atomic_mass": 127.6, "category": "metalloid", "xpos": 16, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p⁴", "summary": "Редкий, хрупкий полуметалл. Применяется в сплавах и полупроводниках." },
    { "name": "Йод", "symbol": "I", "number": 53, "atomic_mass": 126.90447, "category": "diatomic-nonmetal", "xpos": 17, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p⁵", "summary": "Галоген, твёрдое вещество при комнатной температуре. Важен для работы щитовидной железы, используется как антисептик." },
    { "name": "Ксенон", "symbol": "Xe", "number": 54, "atomic_mass": 131.293, "category": "noble-gas", "xpos": 18, "ypos": 5, "electron_configuration": "[Kr] 4d¹⁰ 5s² 5p⁶", "summary": "Тяжёлый и редкий инертный газ. Используется в мощных лампах, фарах и в качестве анестетика." },
    { "name": "Цезий", "symbol": "Cs", "number": 55, "atomic_mass": 132.90545196, "category": "alkali-metal", "xpos": 1, "ypos": 6, "electron_configuration": "[Xe] 6s¹", "summary": "Самый активный из щелочных металлов, воспламеняется на воздухе. Используется в атомных часах высокой точности." },
    { "name": "Барий", "symbol": "Ba", "number": 56, "atomic_mass": 137.327, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 6, "electron_configuration": "[Xe] 6s²", "summary": "Мягкий, серебристо-белый щелочноземельный металл. Используется в вакуумной технике и для придания зелёного цвета фейерверкам." },
    { "name": "Лантан", "symbol": "La", "number": 57, "atomic_mass": 138.90547, "category": "lanthanide", "xpos": 3, "ypos": 9, "electron_configuration": "[Xe] 5d¹ 6s²", "summary": "Первый элемент из группы лантаноидов. Используется в катализаторах и оптическом стекле." },
    { "name": "Церий", "symbol": "Ce", "number": 58, "atomic_mass": 140.116, "category": "lanthanide", "xpos": 4, "ypos": 9, "electron_configuration": "[Xe] 4f¹ 5d¹ 6s²", "summary": "Самый распространённый из редкоземельных элементов. Используется в катализаторах и для полировки стекла." },
    { "name": "Празеодим", "symbol": "Pr", "number": 59, "atomic_mass": 140.90766, "category": "lanthanide", "xpos": 5, "ypos": 9, "electron_configuration": "[Xe] 4f³ 6s²", "summary": "Мягкий, ковкий лантаноид. Используется для создания сильных магнитов и для окрашивания стекла в жёлто-зелёный цвет." },
    { "name": "Неодим", "symbol": "Nd", "number": 60, "atomic_mass": 144.242, "category": "lanthanide", "xpos": 6, "ypos": 9, "electron_configuration": "[Xe] 4f⁴ 6s²", "summary": "Лантаноид, ключевой компонент самых мощных постоянных магнитов (неодимовые магниты)." },
    { "name": "Прометий", "symbol": "Pm", "number": 61, "atomic_mass": 145, "category": "lanthanide", "xpos": 7, "ypos": 9, "electron_configuration": "[Xe] 4f⁵ 6s²", "summary": "Радиоактивный лантаноид, не имеющий стабильных изотопов. Используется в атомных батареях." },
    { "name": "Самарий", "symbol": "Sm", "number": 62, "atomic_mass": 150.36, "category": "lanthanide", "xpos": 8, "ypos": 9, "electron_configuration": "[Xe] 4f⁶ 6s²", "summary": "Лантаноид, используется в мощных магнитах, работающих при высоких температурах, и в ядерной технике." },
    { "name": "Европий", "symbol": "Eu", "number": 63, "atomic_mass": 151.964, "category": "lanthanide", "xpos": 9, "ypos": 9, "electron_configuration": "[Xe] 4f⁷ 6s²", "summary": "Самый реакционноспособный лантаноид. Используется в люминофорах, придавая красный цвет экранам телевизоров и банкнотам евро." },
    { "name": "Гадолиний", "symbol": "Gd", "number": 64, "atomic_mass": 157.25, "category": "lanthanide", "xpos": 10, "ypos": 9, "electron_configuration": "[Xe] 4f⁷ 5d¹ 6s²", "summary": "Лантаноид с очень высокими магнитными свойствами. Применяется в МРТ-диагностике в качестве контрастного вещества." },
    { "name": "Тербий", "symbol": "Tb", "number": 65, "atomic_mass": 158.92535, "category": "lanthanide", "xpos": 11, "ypos": 9, "electron_configuration": "[Xe] 4f⁹ 6s²", "summary": "Редкоземельный металл, используется для создания зелёного люминофора в энергосберегающих лампах." },
    { "name": "Диспрозий", "symbol": "Dy", "number": 66, "atomic_mass": 162.5, "category": "lanthanide", "xpos": 12, "ypos": 9, "electron_configuration": "[Xe] 4f¹⁰ 6s²", "summary": "Лантаноид, используется в качестве добавки в неодимовые магниты для повышения их термостойкости." },
    { "name": "Гольмий", "symbol": "Ho", "number": 67, "atomic_mass": 164.93033, "category": "lanthanide", "xpos": 13, "ypos": 9, "electron_configuration": "[Xe] 4f¹¹ 6s²", "summary": "Обладает самыми сильными магнитными свойствами из всех элементов. Используется в лазерах и магнитных концентраторах." },
    { "name": "Эрбий", "symbol": "Er", "number": 68, "atomic_mass": 167.259, "category": "lanthanide", "xpos": 14, "ypos": 9, "electron_configuration": "[Xe] 4f¹² 6s²", "summary": "Используется в лазерах для медицины и косметологии, а также для окрашивания стекла в розовый цвет." },
    { "name": "Тулий", "symbol": "Tm", "number": 69, "atomic_mass": 168.93422, "category": "lanthanide", "xpos": 15, "ypos": 9, "electron_configuration": "[Xe] 4f¹³ 6s²", "summary": "Самый редкий из стабильных лантаноидов. Используется в портативных рентгеновских аппаратах." },
    { "name": "Иттербий", "symbol": "Yb", "number": 70, "atomic_mass": 173.045, "category": "lanthanide", "xpos": 16, "ypos": 9, "electron_configuration": "[Xe] 4f¹⁴ 6s²", "summary": "Мягкий лантаноид. Применяется в волоконных лазерах и для легирования стали." },
    { "name": "Лютеций", "symbol": "Lu", "number": 71, "atomic_mass": 174.9668, "category": "lanthanide", "xpos": 17, "ypos": 9, "electron_configuration": "[Xe] 4f¹⁴ 5d¹ 6s²", "summary": "Самый тяжёлый и твёрдый из лантаноидов. Используется в качестве катализатора в нефтехимии." },
    { "name": "Гафний", "symbol": "Hf", "number": 72, "atomic_mass": 178.49, "category": "transition-metal", "xpos": 4, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d² 6s²", "summary": "Химически похож на цирконий. Используется в ядерных реакторах и микроэлектронике." },
    { "name": "Тантал", "symbol": "Ta", "number": 73, "atomic_mass": 180.94788, "category": "transition-metal", "xpos": 5, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d³ 6s²", "summary": "Тугоплавкий и коррозионностойкий металл. Используется для производства компактных и надёжных конденсаторов." },
    { "name": "Вольфрам", "symbol": "W", "number": 74, "atomic_mass": 183.84, "category": "transition-metal", "xpos": 6, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d⁴ 6s²", "summary": "Металл с самой высокой температурой плавления. Используется в нитях накаливания ламп и в сверхтвёрдых сплавах." },
    { "name": "Рений", "symbol": "Re", "number": 75, "atomic_mass": 186.207, "category": "transition-metal", "xpos": 7, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d⁵ 6s²", "summary": "Один из самых редких и тугоплавких металлов. Применяется в жаропрочных сплавах для лопаток турбин реактивных двигателей." },
    { "name": "Осмий", "symbol": "Os", "number": 76, "atomic_mass": 190.23, "category": "transition-metal", "xpos": 8, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d⁶ 6s²", "summary": "Самый плотный из всех элементов. Используется в износостойких сплавах для перьев ручек и электрических контактов." },
    { "name": "Иридий", "symbol": "Ir", "number": 77, "atomic_mass": 192.217, "category": "transition-metal", "xpos": 9, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d⁷ 6s²", "summary": "Очень твёрдый и коррозионностойкий металл платиновой группы. Используется в свечах зажигания и тиглях для выращивания кристаллов." },
    { "name": "Платина", "symbol": "Pt", "number": 78, "atomic_mass": 195.084, "category": "transition-metal", "xpos": 10, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d⁹ 6s¹", "summary": "Благородный металл, очень устойчивый к коррозии. Широко используется в ювелирном деле, катализаторах и лабораторном оборудовании." },
    { "name": "Золото", "symbol": "Au", "number": 79, "atomic_mass": 196.966569, "category": "transition-metal", "xpos": 11, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", "summary": "Благородный металл, ценимый за свою красоту, редкость и химическую инертность. Используется в ювелирных изделиях и электронике." },
    { "name": "Ртуть", "symbol": "Hg", "number": 80, "atomic_mass": 200.592, "category": "transition-metal", "xpos": 12, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s²", "summary": "Единственный металл, жидкий при стандартных условиях. Токсичен. Применяется в термометрах, барометрах и люминесцентных лампах." },
    { "name": "Таллий", "symbol": "Tl", "number": 81, "atomic_mass": 204.38, "category": "post-transition-metal", "xpos": 13, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", "summary": "Мягкий, токсичный металл. Ранее использовался в ядах для грызунов, сейчас — в специальной оптике." },
    { "name": "Свинец", "symbol": "Pb", "number": 82, "atomic_mass": 207.2, "category": "post-transition-metal", "xpos": 14, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", "summary": "Тяжёлый, ковкий и токсичный металл. Используется в аккумуляторах и для защиты от радиации." },
    { "name": "Висмут", "symbol": "Bi", "number": 83, "atomic_mass": 208.9804, "category": "post-transition-metal", "xpos": 15, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", "summary": "Тяжёлый, хрупкий металл с розоватым оттенком. Один из наименее токсичных тяжёлых металлов, используется в косметике и медицине." },
    { "name": "Полоний", "symbol": "Po", "number": 84, "atomic_mass": 209, "category": "post-transition-metal", "xpos": 16, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", "summary": "Чрезвычайно радиоактивный и редкий элемент. Используется как источник альфа-частиц." },
    { "name": "Астат", "symbol": "At", "number": 85, "atomic_mass": 210, "category": "metalloid", "xpos": 17, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", "summary": "Самый редкий природный элемент на Земле, очень радиоактивен. Изучается для применения в ядерной медицине." },
    { "name": "Радон", "symbol": "Rn", "number": 86, "atomic_mass": 222, "category": "noble-gas", "xpos": 18, "ypos": 6, "electron_configuration": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", "summary": "Тяжёлый радиоактивный инертный газ. Образуется при распаде радия и представляет опасность в закрытых помещениях." },
    { "name": "Франций", "symbol": "Fr", "number": 87, "atomic_mass": 223, "category": "alkali-metal", "xpos": 1, "ypos": 7, "electron_configuration": "[Rn] 7s¹", "summary": "Крайне радиоактивный и нестабильный щелочной металл. Имеет самое низкое значение электроотрицательности." },
    { "name": "Радий", "symbol": "Ra", "number": 88, "atomic_mass": 226, "category": "alkaline-earth-metal", "xpos": 2, "ypos": 7, "electron_configuration": "[Rn] 7s²", "summary": "Радиоактивный щелочноземельный металл, светящийся в темноте. Ранее использовался в светящихся красках." },
    { "name": "Актиний", "symbol": "Ac", "number": 89, "atomic_mass": 227, "category": "actinide", "xpos": 3, "ypos": 10, "electron_configuration": "[Rn] 6d¹ 7s²", "summary": "Первый элемент группы актиноидов. Высокорадиоактивен, используется как источник нейтронов." },
    { "name": "Торий", "symbol": "Th", "number": 90, "atomic_mass": 232.0377, "category": "actinide", "xpos": 4, "ypos": 10, "electron_configuration": "[Rn] 6d² 7s²", "summary": "Слаборадиоактивный металл. Рассматривается как потенциальное топливо для ядерных реакторов." },
    { "name": "Протактиний", "symbol": "Pa", "number": 91, "atomic_mass": 231.03588, "category": "actinide", "xpos": 5, "ypos": 10, "electron_configuration": "[Rn] 5f² 6d¹ 7s²", "summary": "Редкий и высокорадиоактивный актиноид. Не имеет практического применения из-за своей токсичности." },
    { "name": "Уран", "symbol": "U", "number": 92, "atomic_mass": 238.02891, "category": "actinide", "xpos": 6, "ypos": 10, "electron_configuration": "[Rn] 5f³ 6d¹ 7s²", "summary": "Тяжёлый, радиоактивный металл, основной вид топлива в ядерной энергетике и сырьё для ядерного оружия." },
    { "name": "Нептуний", "symbol": "Np", "number": 93, "atomic_mass": 237, "category": "actinide", "xpos": 7, "ypos": 10, "electron_configuration": "[Rn] 5f⁴ 6d¹ 7s²", "summary": "Первый трансурановый элемент. Радиоактивен, используется в детекторах нейтронов." },
    { "name": "Плутоний", "symbol": "Pu", "number": 94, "atomic_mass": 244, "category": "actinide", "xpos": 8, "ypos": 10, "electron_configuration": "[Rn] 5f⁶ 7s²", "summary": "Высокорадиоактивный трансурановый элемент. Используется как топливо в ядерных реакторах и в ядерном оружии." },
    { "name": "Америций", "symbol": "Am", "number": 95, "atomic_mass": 243, "category": "actinide", "xpos": 9, "ypos": 10, "electron_configuration": "[Rn] 5f⁷ 7s²", "summary": "Синтетический радиоактивный элемент. Используется в бытовых детекторах дыма." },
    { "name": "Кюрий", "symbol": "Cm", "number": 96, "atomic_mass": 247, "category": "actinide", "xpos": 10, "ypos": 10, "electron_configuration": "[Rn] 5f⁷ 6d¹ 7s²", "summary": "Синтетический радиоактивный металл. Используется как источник альфа-частиц в научных исследованиях." },
    { "name": "Берклий", "symbol": "Bk", "number": 97, "atomic_mass": 247, "category": "actinide", "xpos": 11, "ypos": 10, "electron_configuration": "[Rn] 5f⁹ 7s²", "summary": "Синтетический радиоактивный элемент. Получается в очень малых количествах и используется только в исследованиях." },
    { "name": "Калифорний", "symbol": "Cf", "number": 98, "atomic_mass": 251, "category": "actinide", "xpos": 12, "ypos": 10, "electron_configuration": "[Rn] 5f¹⁰ 7s²", "summary": "Очень мощный источник нейтронов. Используется для запуска ядерных реакторов и в лучевой терапии." },
    { "name": "Эйнштейний", "symbol": "Es", "number": 99, "atomic_mass": 252, "category": "actinide", "xpos": 13, "ypos": 10, "electron_configuration": "[Rn] 5f¹¹ 7s²", "summary": "Синтетический радиоактивный элемент. Используется исключительно в научных исследованиях для получения более тяжёлых элементов." },
    { "name": "Фермий", "symbol": "Fm", "number": 100, "atomic_mass": 257, "category": "actinide", "xpos": 14, "ypos": 10, "electron_configuration": "[Rn] 5f¹² 7s²", "summary": "Синтетический элемент. Не имеет применений вне фундаментальных научных исследований." },
    { "name": "Менделевий", "symbol": "Md", "number": 101, "atomic_mass": 258, "category": "actinide", "xpos": 15, "ypos": 10, "electron_configuration": "[Rn] 5f¹³ 7s²", "summary": "Синтетический элемент, названный в честь Дмитрия Менделеева. Используется в научных исследованиях." },
    { "name": "Нобелий", "symbol": "No", "number": 102, "atomic_mass": 259, "category": "actinide", "xpos": 16, "ypos": 10, "electron_configuration": "[Rn] 5f¹⁴ 7s²", "summary": "Синтетический радиоактивный элемент. Изучение его свойств помогает понять поведение сверхтяжёлых элементов." },
    { "name": "Лоуренсий", "symbol": "Lr", "number": 103, "atomic_mass": 266, "category": "actinide", "xpos": 17, "ypos": 10, "electron_configuration": "[Rn] 5f¹⁴ 7s² 7p¹", "summary": "Синтетический радиоактивный элемент, завершающий ряд актиноидов." },
    { "name": "Резерфордий", "symbol": "Rf", "number": 104, "atomic_mass": 267, "category": "transition-metal", "xpos": 4, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d² 7s²", "summary": "Первый трансактиноидный элемент. Все известные изотопы крайне нестабильны." },
    { "name": "Дубний", "symbol": "Db", "number": 105, "atomic_mass": 268, "category": "transition-metal", "xpos": 5, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d³ 7s²", "summary": "Синтетический радиоактивный элемент, названный в честь наукограда Дубна." },
    { "name": "Сиборгий", "symbol": "Sg", "number": 106, "atomic_mass": 269, "category": "transition-metal", "xpos": 6, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁴ 7s²", "summary": "Синтетический радиоактивный элемент. Его химические свойства схожи с вольфрамом." },
    { "name": "Борий", "symbol": "Bh", "number": 107, "atomic_mass": 270, "category": "transition-metal", "xpos": 7, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁵ 7s²", "summary": "Синтетический радиоактивный элемент, названный в честь Нильса Бора." },
    { "name": "Хассий", "symbol": "Hs", "number": 108, "atomic_mass": 269, "category": "transition-metal", "xpos": 8, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁶ 7s²", "summary": "Синтетический радиоактивный элемент. По химическим свойствам похож на осмий." },
    { "name": "Мейтнерий", "symbol": "Mt", "number": 109, "atomic_mass": 278, "category": "unknown", "xpos": 9, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁷ 7s²", "summary": "Синтетический радиоактивный элемент, названный в честь Лизы Мейтнер." },
    { "name": "Дармштадтий", "symbol": "Ds", "number": 110, "atomic_mass": 281, "category": "unknown", "xpos": 10, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁸ 7s²", "summary": "Синтетический радиоактивный элемент. Ожидается, что будет похож на платину." },
    { "name": "Рентгений", "symbol": "Rg", "number": 111, "atomic_mass": 282, "category": "unknown", "xpos": 11, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d⁹ 7s²", "summary": "Синтетический радиоактивный элемент, названный в честь Вильгельма Рентгена." },
    { "name": "Коперниций", "symbol": "Cn", "number": 112, "atomic_mass": 285, "category": "transition-metal", "xpos": 12, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s²", "summary": "Синтетический радиоактивный элемент. Предполагается, что он может быть жидким при комнатной температуре, как ртуть." },
    { "name": "Нихоний", "symbol": "Nh", "number": 113, "atomic_mass": 286, "category": "unknown", "xpos": 13, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", "summary": "Синтетический радиоактивный элемент, открытый в Японии." },
    { "name": "Флеровий", "symbol": "Fl", "number": 114, "atomic_mass": 289, "category": "post-transition-metal", "xpos": 14, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", "summary": "Синтетический радиоактивный элемент, названный в честь Лаборатории ядерных реакций им. Г. Н. Флёрова." },
    { "name": "Московий", "symbol": "Mc", "number": 115, "atomic_mass": 290, "category": "unknown", "xpos": 15, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", "summary": "Синтетический радиоактивный элемент, названный в честь Московской области." },
    { "name": "Ливерморий", "symbol": "Lv", "number": 116, "atomic_mass": 293, "category": "unknown", "xpos": 16, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", "summary": "Синтетический радиоактивный элемент, названный в честь Ливерморской национальной лаборатории." },
    { "name": "Теннессин", "symbol": "Ts", "number": 117, "atomic_mass": 294, "category": "unknown", "xpos": 17, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", "summary": "Синтетический радиоактивный элемент, относится к галогенам. Назван в честь штата Теннесси." },
    { "name": "Оганесон", "symbol": "Og", "number": 118, "atomic_mass": 294, "category": "unknown", "xpos": 18, "ypos": 7, "electron_configuration": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", "summary": "Синтетический радиоактивный элемент, завершающий седьмой период таблицы. Назван в честь Юрия Оганесяна." }
];


// --- Карта категорий для стилизации и названий ---
const categoryMap = {
    'diatomic-nonmetal': { name: 'Неметалл (двухатомный)', class: 'bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200' },
    'noble-gas': { name: 'Инертный газ', class: 'bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200' },
    'alkali-metal': { name: 'Щелочной металл', class: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200' },
    'alkaline-earth-metal': { name: 'Щелочноземельный металл', class: 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200' },
    'metalloid': { name: 'Полуметалл', class: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200' },
    'polyatomic-nonmetal': { name: 'Неметалл (полиатомный)', class: 'bg-green-300 text-green-900 dark:bg-green-800/60 dark:text-green-200' },
    'post-transition-metal': { name: 'Постпереходный металл', class: 'bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200' },
    'transition-metal': { name: 'Переходный металл', class: 'bg-sky-200 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200' },
    'lanthanide': { name: 'Лантаноид', class: 'bg-teal-200 text-teal-900 dark:bg-teal-900/50 dark:text-teal-200' },
    'actinide': { name: 'Актиноид', class: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200' },
    'unknown': { name: 'Неизвестные свойства', class: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100' }
};

// --- Основные функции модуля ---

/**
 * Возвращает HTML-структуру приложения.
 */
export function getHtml() {
    const elementCells = elements.map(el => {
        // Определяем, относится ли элемент к основному блоку или вынесенному
        let ypos = el.ypos;
        if (el.category === 'lanthanide') ypos = 9;
        if (el.category === 'actinide') ypos = 10;

        // Для первых элементов лантаноидов и актиноидов создаем "заглушки" в основной таблице
        let placeholderHtml = '';
        if (el.number === 57) {
            placeholderHtml = `<div class="pt-element-cell flex flex-col justify-center items-center p-1 rounded text-center text-xs ${categoryMap.lanthanide.class}" style="grid-column: 3; grid-row: 6;">57-71</div>`;
        }
        if (el.number === 89) {
            placeholderHtml = `<div class="pt-element-cell flex flex-col justify-center items-center p-1 rounded text-center text-xs ${categoryMap.actinide.class}" style="grid-column: 3; grid-row: 7;">89-103</div>`;
        }

        return `
            <div class="pt-element-cell flex flex-col justify-center items-center p-1 rounded cursor-pointer transition-transform hover:scale-110 hover:z-10 ${categoryMap[el.category]?.class || categoryMap.unknown.class}" 
                 style="grid-column: ${el.xpos}; grid-row: ${ypos};" 
                 data-number="${el.number}">
                <div class="text-xs">${el.number}</div>
                <div class="text-lg font-bold">${el.symbol}</div>
                <div class="text-xs truncate text-center">${el.name}</div>
            </div>
            ${placeholderHtml}
        `;
    }).join('');

    return `
        <style>
            #pt-table { 
                grid-template-rows: repeat(7, minmax(0, 1fr)) 20px repeat(2, minmax(0, 1fr));
            }
            .pt-element-cell { 
                aspect-ratio: 1/1; 
                min-width: 50px; /* Минимальная ширина для читаемости на мобильных */
            }
        </style>
        <div class="flex flex-col xl:flex-row gap-4">
            <!-- Таблица -->
            <div class="overflow-x-auto pb-4">
                 <div id="pt-table" class="grid grid-cols-18 gap-1 w-full min-w-[980px]">
                    ${elementCells}
                </div>
            </div>
            
            <!-- Панель информации -->
            <div id="pt-detail-panel" class="w-full xl:w-100 flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                <div id="pt-detail-content" class="text-center space-y-3 sticky top-4">
                    <!-- Содержимое будет вставлено JavaScript -->
                    <p class="text-gray-500 dark:text-gray-400 pt-10 text-sm">Выберите элемент, чтобы увидеть информацию о нём.</p>
                </div>
            </div>
        </div>
    `;
}


/**
 * Инициализирует логику приложения.
 */
export function init() {
    const table = document.getElementById('pt-table');
    const detailContent = document.getElementById('pt-detail-content');
    let activeCell = null;

    function updateDetailView(element) {
        const categoryInfo = categoryMap[element.category] || categoryMap.unknown;
        detailContent.innerHTML = `
            <div class="pt-element-cell-large text-5xl font-bold w-32 h-32 mx-auto flex flex-col justify-center items-center rounded-lg ${categoryInfo.class}">
                <span>${element.symbol}</span>
                <span class="text-sm font-normal">${element.number}</span>
            </div>
            <h2 class="text-2xl font-bold">${element.name}</h2>
            <div class="text-left space-y-2 text-sm pt-2">
                <p><strong>Категория:</strong> ${categoryInfo.name}</p>
                <p><strong>Атомная масса:</strong> ${element.atomic_mass} u</p>
                <p><strong>Электронная конфигурация:</strong> ${element.electron_configuration}</p>
                <p class="pt-2">${element.summary}</p>
            </div>
        `;
    }

    table.addEventListener('click', (e) => {
        const cell = e.target.closest('.pt-element-cell');
        if (!cell || !cell.dataset.number) return; // Игнорируем заглушки

        if (activeCell) {
            activeCell.classList.remove('ring-2', 'ring-blue-500', 'z-20', 'scale-110');
        }
        activeCell = cell;
        activeCell.classList.add('ring-2', 'ring-blue-500', 'z-20', 'scale-110');

        const elementNumber = parseInt(cell.dataset.number, 10);
        const elementData = elements.find(el => el.number === elementNumber);

        if (elementData) {
            updateDetailView(elementData);
        }
    });
}

/**
 * Очищает ресурсы при выходе из приложения.
 */
export function cleanup() {
    // В данном приложении нет таймеров или глобальных слушателей,
    // поэтому специальная очистка не требуется.
}
