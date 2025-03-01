// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAbZ9Aty-PQbRwBqNnADdoDcGrhIWZo2BE",
  authDomain: "globetrotter-482e6.firebaseapp.com",
  projectId: "globetrotter-482e6",
  storageBucket: "globetrotter-482e6.firebasestorage.app",
  messagingSenderId: "539129412895",
  appId: "1:539129412895:web:811564e45f7c0f8410442a",
  measurementId: "G-QNSQ0G9V0C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cities = [
  {
    city: "Nanchang",
    country: "China",
    clues: [
      "This city is known as the birthplace of the People's Liberation Army and played a pivotal role in Chinese history during the Nanchang Uprising.",
      "Nestled between a prominent lake and a mountain range, this city has become a significant railway hub in Southern China.",
    ],
    fun_fact: [
      "Nanchang is home to Nanchang University, which contributes to its ranking among the top 100 cities globally for scientific research outputs.",
      "The city's location near Poyang Lake makes it an important area for freshwater fisheries and biodiversity.",
    ],
    trivia: [
      "The Jiuling Mountains to the west of the city provide a natural barrier and scenic beauty, enhancing the region's appeal.",
      "Nanchang is also known for the Tengwang Pavilion, a famous historic building that has been a significant cultural symbol in Chinese literature.",
    ],
  },
  {
    city: "Lima",
    country: "Peru",
    clues: [
      "This city, founded in 1535, is known as the 'City of Kings' and serves as the political and cultural capital of its country.",
      "Located along the Pacific Ocean, this metropolis is not only the largest city in its country but is also categorized as a 'beta' tier city in terms of global importance.",
    ],
    fun_fact: [
      "The city has a population of over 10 million people, making it one of the largest cities in South America.",
      "Lima is known for its diverse culinary scene, being recognized as one of the world's top gastronomic destinations.",
    ],
    trivia: [
      "The city is situated in a desert zone but surprisingly has a mild climate due to the influence of the nearby ocean.",
      "Lima is home to some of the most significant historical sites in Peru, including the UNESCO World Heritage Site of the Historic Centre of Lima.",
    ],
  },
  {
    city: "Lahore",
    country: "Pakistan",
    clues: [
      "This city is known for its rich history, having been a capital for several empires and serving as a cultural hub during the Mughal era.",
      "It is often referred to as the heart of Punjab and is the second-largest city in Pakistan, renowned for its vibrant arts and culinary scene.",
    ],
    fun_fact: [
      "Lahore is home to the Lahore Fort and the Badshahi Mosque, both masterpieces of Mughal architecture and significant UNESCO World Heritage Sites.",
      "The city hosts the annual Lahore Literary Festival, showcasing literature, art, and culture in the region.",
    ],
    trivia: [
      "Lahore has a rich tradition of traditional dog breeds, including the famous 'Lahori Bulldog'.",
      "The city is often recognized for its lively festivals, including Basant, which celebrates the onset of spring with kite flying.",
    ],
  },
  {
    city: "Chongqing",
    country: "China",
    clues: [
      "This municipality is the only one in China that lies deep inland and is known for its spicy cuisine, particularly a famed hot pot dish.",
      "It holds the title of the largest city proper in the world by population, yet it is not the most populous urban area.",
    ],
    fun_fact: [
      "The municipality is roughly the size of Austria, containing significant urban areas and vast rural regions.",
      "Chongqing is home to the Yangtze River, which is the longest river in Asia and plays a vital role in the city's transportation and economy.",
    ],
    trivia: [
      "Chongqing was designated as a direct-administered municipality in 1997, separating it from Sichuan province.",
      "The city is also known for its hilly terrain and has a unique climate characterized by hot, humid summers and mild winters.",
    ],
  },
  {
    city: "Fukuoka",
    country: "Japan",
    clues: [
      "This city, located on the shores of a bay, is often regarded as the gateway to Japan from the Asian mainland.",
      "Known for its unique local culture and dialect, this city is the most populous on its island and has a rich history dating back to ancient times.",
    ],
    fun_fact: [
      "Fukuoka was historically a center of international commerce and has long played an important role in Japan's trade with the mainland.",
      "The city is famous for its delicious ramen, particularly Hakata ramen, which is known for its rich pork broth and thin noodles.",
    ],
    trivia: [
      "Fukuoka is home to the annual Hakata Gion Yamakasa festival, where stunning floats are paraded through the streets over a period of 15 days.",
      "The city has a unique characteristic known as 'fukuoka dialect,' which differs significantly from standard Japanese and is a source of local pride.",
    ],
  },
  {
    city: "Bekasi",
    country: "Indonesia",
    clues: [
      "This city is part of the largest metropolitan area in Indonesia and is often considered a commuter city for a neighboring capital.",
      "Historically, this city was once the capital of a significant kingdom, with evidence of its heritage dating back to the fifth century.",
    ],
    fun_fact: [
      "The city of Bekasi has a diverse population, making it the city with the largest number of inhabitants in West Java.",
      "It was administratively separated from Bekasi Regency in 1996, reflecting its growth and urban development.",
    ],
    trivia: [
      "The city's name has historical significance, being linked to an ancient kingdom known as Tarumanagara.",
      "Bekasi is bordered by several significant areas, including the city of East Jakarta and the Bogor Regency, which contributes to its role as a vital urban hub.",
    ],
  },
  {
    city: "Delhi",
    country: "India",
    clues: [
      "This city is home to a UNESCO World Heritage Site that was once the capital of two major empires and has a historical fort that aligns with descriptions from ancient Indian epics.",
      "Straddling the Yamuna river, this city is not only the capital of India but also serves as a vibrant cultural and political hub in the country.",
    ],
    fun_fact: [
      "Delhi has one of the highest populations among cities in the world, housing over 16 million residents in its National Capital Territory.",
      "The city features an intricate mix of modern and ancient architecture, including landmarks like the Red Fort, India Gate, and modern-day skyscrapers.",
    ],
    trivia: [
      "Delhi became a union territory in 1956 and officially designated as the National Capital Territory in 1995.",
      "It is known for its diverse culture, with more than 150 ethnic communities residing in the area.",
    ],
  },
  {
    city: "Curitiba",
    country: "Brazil",
    clues: [
      "This Brazilian city is known for its innovative urban planning and sustainability efforts, making it a model for cities worldwide.",
      "As the capital of a state in Southern Brazil, it is often associated with its rich cultural heritage and is home to the oldest university in the region.",
    ],
    fun_fact: [
      "Curitiba is located on a plateau, making it one of the highest major cities in Brazil, standing at 932 meters (3,058 feet) above sea level.",
      "The city has a well-regarded public transportation system, featuring dedicated bus lanes that have significantly improved urban mobility.",
    ],
    trivia: [
      "Curitiba was founded in the 17th century and began to thrive due to its strategic location for cattle trade.",
      "The city is known for its extensive parks and green spaces, including the well-known Barigui Park, which attracts both locals and tourists.",
    ],
  },
  {
    city: "Ho Chi Minh City",
    country: "Vietnam",
    clues: [
      "This bustling metropolis is often referred to by its former name, which shares its name with a famous historical figure.",
      "Known for its vibrant street life and unique blend of traditional and modern architecture, this city is also the largest financial hub in Vietnam.",
    ],
    fun_fact: [
      "The city's name was changed in 1976 to honor a prominent Vietnamese leader, following the end of the Vietnam War.",
      "Ho Chi Minh City is situated along the Saigon River, which plays a crucial role in its geography and economy.",
    ],
    trivia: [
      "The city's annual Tet Festival attracts thousands of visitors, showcasing Vietnamese culture and traditions during the lunar new year.",
      "The famous Ben Thanh Market has been a long-standing symbol of the city, known for its wide array of local goods and food.",
    ],
  },
  {
    city: "Ankara",
    country: "Turkey",
    clues: [
      "This city is not only the capital of its country but also has a rich history dating back to ancient times, including being the capital of a Celtic state.",
      "Known for its significant archaeological sites, this city was once called Ancyra and has seen various empires, from the Hittites to the Ottomans.",
    ],
    fun_fact: [
      "Ankara is Turkey's second-largest city by population and is known for its prime location in the central part of Anatolia.",
      "The city houses the mausoleum of Mustafa Kemal Atatürk, the founder of modern Turkey, which is a key national landmark.",
    ],
    trivia: [
      "The city was known as Angora in ancient times, and it is famous for its Angora goat and the wool it produces.",
      "Ankara became the capital of Turkey on 13 October 1923, replacing Istanbul as the center of government.",
    ],
  },
  {
    city: "Ürümqi",
    country: "China",
    clues: [
      "This city serves as the capital of a region known for its diverse cultures and ethnic groups, particularly the Uyghurs.",
      "Recognized for its significant scientific research contributions, this city is also one of the largest in Central Asia.",
    ],
    fun_fact: [
      "Ürümqi is the farthest city from any ocean in the world, making it a fascinating geographic point.",
      "The city has experienced rapid economic growth since the 1990s and has developed into a major transport and commercial hub.",
    ],
    trivia: [
      "Ürümqi is home to Xinjiang University, considered the highest academic institution in the region.",
      "As of 2020, Ürümqi had a population of approximately 4 million, making it the second-largest city in China's northwestern interior.",
    ],
  },
  {
    city: "Atlanta",
    country: "United States",
    clues: [
      "This city is known for its role in the civil rights movement and is home to the Martin Luther King Jr. National Historical Park.",
      "Famous for its contributions to music, particularly genres like hip-hop and R&B, it houses iconic recording studios and venues.",
    ],
    fun_fact: [
      "Atlanta boasts the highest number of trees in a major U.S. city, with approximately 48% of the city covered in greenery.",
      "The world's busiest airport, Hartsfield-Jackson Atlanta International Airport, is located in this city.",
    ],
    trivia: [
      "Atlanta was originally founded as a transportation hub and was initially named Terminus.",
      "The city played a significant role in the American Civil War, serving as a key supply center for the Confederate army.",
    ],
  },
  {
    city: "Tehran",
    country: "Iran",
    clues: [
      "This city, serving as the capital and largest metropolis of its country, has a population that makes it the most populous city in Western Asia.",
      "Once home to a significant Median city known as Rhages, this modern capital has seen much historical change and cultural evolution.",
    ],
    fun_fact: [
      "Tehran is the second-largest metropolitan area in the Middle East, after Cairo.",
      "The metropolitan area of Greater Tehran encompasses several municipalities, showcasing a diverse urban landscape.",
    ],
    trivia: [
      "Tehran has a rich history that stretches back to ancient times, with remnants of its historical roots found in nearby Ray.",
      "The city is known for its mix of modern and traditional architecture, reflecting its status as a cultural and political hub in Iran.",
    ],
  },
  {
    city: "Belém",
    country: "Brazil",
    clues: [
      "This city is known as the gateway to the Amazon River and is located on the Pará River.",
      "It was founded by the Portuguese in the early 17th century and is the capital of a Brazilian state named after a bean.",
    ],
    fun_fact: [
      "Belém's port is one of the busiest in Brazil, serving as a crucial link for goods traveling to and from the Amazon region.",
      "This city is home to several unique local dishes that showcase the diverse ingredients from the Amazon rainforest.",
    ],
    trivia: [
      "Belém has a population of over 1.3 million people, making it the 12th most populous city in Brazil.",
      "The city is famous for its vibrant weekly market called Ver-o-Peso, which is one of the oldest and largest open-air markets in Brazil.",
    ],
  },
  {
    city: "Casablanca",
    country: "Morocco",
    clues: [
      "This city is the economic heart of its country and is known for its significant financial sector, ranking among the top global finance centers.",
      "It features one of the largest artificial ports in Africa and is also famous for its astonishing neo-Moorish architecture.",
    ],
    fun_fact: [
      "The name of this city translates to 'the White House' in Arabic, reflecting its distinctive white buildings.",
      "It is the most populous city in the Maghreb region, with a metropolitan area surpassing 4 million inhabitants.",
    ],
    trivia: [
      "The city is home to the Hassan II Mosque, which boasts one of the tallest minarets in the world, standing at 210 meters.",
      "Casablanca serves as a primary naval base for the Royal Moroccan Navy and plays a crucial role in maritime trade.",
    ],
  },
  {
    city: "Benoni",
    country: "South Africa",
    clues: [
      "This city is known for its numerous lakes and is often referred to as a place for water sports enthusiasts.",
      "Located in Gauteng province, this city has a history tied to gold mining and has evolved into a bustling urban area.",
    ],
    fun_fact: [
      "Benoni was established in 1881 and was originally founded as a gold mining town.",
      "The city is home to the famous Benoni Lake, a popular spot for fishing and outdoor activities.",
    ],
    trivia: [
      "Benoni was once part of the East Rand mining area where significant gold deposits were discovered in the late 19th century.",
      "The city's name is derived from a biblical name, meaning 'son of my sorrow', reflecting the emotions of its founders.",
    ],
  },
  {
    city: "Baku",
    country: "Azerbaijan",
    clues: [
      "This city is located below sea level and holds the title of the world's lowest capital city.",
      "Known for its modern architecture and ancient sites, this city is a cultural hub on the shores of the Caspian Sea.",
    ],
    fun_fact: [
      "The city is home to the Old City, which includes historical landmarks such as the Palace of the Shirvanshahs and the Maiden Tower.",
      "Baku produces about 60% of Azerbaijan's industrial output, thanks to its rich oil resources.",
    ],
    trivia: [
      "Baku is divided into twelve administrative raions and is the only metropolitan area in Azerbaijan.",
      "The urban population of Baku was estimated to be around two million people as of 2009, accounting for approximately 25% of the country's total population.",
    ],
  },
  {
    city: "Detroit",
    country: "United States",
    clues: [
      "This city is known as the birthplace of Motown music and has a rich musical legacy that includes genres like jazz and techno.",
      "Located on the banks of a river that separates the United States from Canada, this city played a pivotal role in the automotive industry.",
    ],
    fun_fact: [
      "The city was named after the French word for 'strait', reflecting its location along the Detroit River.",
      "Detroit has a historical connection to urban agriculture, with many community gardens and farming initiatives in its neighborhoods.",
    ],
    trivia: [
      "The Detroit River is home to a unique phenomenon known as the 'Detroit River Flooding', where the river can change its flow direction due to seasonal winds.",
      "The famous engine known as the Ford Model T was first manufactured in Detroit, revolutionizing the automobile industry and production methods.",
    ],
  },
  {
    city: "Dar es Salaam",
    country: "Tanzania",
    clues: [
      "This city is the largest in East Africa and was once the main administrative center for German East Africa.",
      "Known as the 'Abode of Peace', this metropolis is a major hub for arts, fashion, and finance in Tanzania.",
    ],
    fun_fact: [
      "Dar es Salaam has a population of over ten million, making it the sixth-largest city in Africa.",
      "The capital of Tanzania was officially moved to this city’s inland counterpart, Dodoma, in 1996.",
    ],
    trivia: [
      "Founded in the mid-19th century, it has rapidly grown to become one of the fastest-growing cities in the world.",
      "The city's coastal location on the Swahili coast has made it an important economic center in the region.",
    ],
  },
  {
    city: "Tokyo",
    country: "Japan",
    clues: [
      "This city is not only Japan's capital but also the most populous metropolitan area in the world, with a staggering 41 million residents in its greater region.",
      "Home to both the Imperial Palace and a bustling mix of traditional and modern culture, this vibrant city is often at the forefront of technology and innovation.",
    ],
    fun_fact: [
      "The city's unique blend of ancient shrines and futuristic architecture creates a striking contrast, making it a fascinating destination for tourists from around the world.",
      "Tokyo hosts the busiest railway station in the world, Shinjuku Station, which serves millions of passengers each day.",
    ],
    trivia: [
      "Despite being classified as a city, Tokyo's governance structure resembles that of a prefecture, with a Governor and Assembly since 1943.",
      "Tokyo is known for its extensive and efficient public transportation system, featuring subways, trains, and buses that span the entire metropolitan area.",
    ],
  },
  {
    city: "El Giza",
    country: "Egypt",
    clues: [
      "This city is home to some of the most iconic ancient structures, including a massive pyramid and a mythical creature with the body of a lion and the head of a human.",
      "Located on the west bank of the Nile, this city is part of a metropolitan area that includes the capital of Egypt, which lies just across the river.",
    ],
    fun_fact: [
      "The population of this city exceeded 4.8 million according to the 2017 census, making it one of the largest cities in Africa.",
      "This city was once the capital of the unified Egyptian state, serving as an important cultural and historical center for thousands of years.",
    ],
    trivia: [
      "The Great Pyramid of Giza is one of the Seven Wonders of the Ancient World and is the only one that remains largely intact today.",
      "The city derives its name from the Arabic word for 'the region' or 'the area,' reflecting its historical significance in ancient Egypt.",
    ],
  },
  {
    city: "Dalian",
    country: "China",
    clues: [
      "This city is located at the southern tip of the Liaodong Peninsula and is a major port city in northeastern China.",
      "Known for its beautiful coastal scenery, this city is also a hub for finance, shipping, and logistics.",
    ],
    fun_fact: [
      "Dalian is often referred to as the 'Hong Kong of the North' due to its vibrant economy and scenic harbor.",
      "The city has a rich history of foreign influence, having been occupied by the Russians and Japanese in the early 20th century.",
    ],
    trivia: [
      "As of 2020, Dalian has a population of over 7.4 million people, making it one of the most populous cities in Northeast China.",
      "The city is famous for its seafood, particularly its fresh fish and shellfish, thanks to its extensive maritime borders.",
    ],
  },
  {
    city: "Santo Domingo",
    country: "Dominican Republic",
    clues: [
      "This city was founded in 1496 and is known as the oldest continuously inhabited European settlement in the Americas.",
      "Once known as Ciudad Trujillo, this capital city is located along the banks of the Ozama River and boasts the largest metropolitan area in the Caribbean.",
    ],
    fun_fact: [
      "Santo Domingo is the site of the first cathedral, the first university, and the first hospital in the Americas.",
      "The city was designated a UNESCO World Heritage site in 1990, recognizing its historical significance and colonial architecture.",
    ],
    trivia: [
      "Santo Domingo was the first capital of the Spanish colonial empire in the New World.",
      "The city is home to the famous Altos de Chavón, a replica 16th-century Mediterranean village that overlooks the Chavón River.",
    ],
  },
  {
    city: "Bogota",
    country: "Colombia",
    clues: [
      "This city sits at an altitude of about 2,640 meters (8,660 feet) above sea level, making it one of the highest capital cities in the world.",
      "Known for its rich history, art scene, and vibrant culture, this metropolis hosts the famous Gold Museum, which boasts an extensive collection of pre-Columbian gold artifacts.",
    ],
    fun_fact: [
      "The city was officially founded on August 6, 1538, by a Spanish conquistador after a challenging expedition.",
      "Bogotá has a unique system of public transportation called TransMilenio, which features a network of dedicated bus lanes to alleviate traffic congestion.",
    ],
    trivia: [
      "The city's name comes from the indigenous Muisca words 'Bacatá' which means 'place where the tombs are.'",
      "It is the main cultural and economic hub of Colombia and is also known as the 'Athens of South America' for its rich literary and artistic heritage.",
    ],
  },
  {
    city: "Johannesburg",
    country: "South Africa",
    clues: [
      "This city is often referred to as 'The City of Gold' and is known for its rich mineral resources, particularly gold.",
      "Located in a province that is the wealthiest in South Africa, this megacity serves as the economic heart of the nation.",
    ],
    fun_fact: [
      "Johannesburg has a population of over 4.8 million people, making it the most populous city in South Africa.",
      "The city is home to the Constitutional Court, which is the highest court in South Africa.",
    ],
    trivia: [
      "Johannesburg was established in 1886 after the discovery of gold, transforming from a farm into a bustling urban center.",
      "The name 'eGoli' in Zulu translates to 'place of gold,' highlighting its historical significance in gold mining.",
    ],
  },
  {
    city: "Nagpur",
    country: "India",
    clues: [
      "This city is known as the 'Orange City' due to its abundant production of oranges and is recognized as the heart of India because of its central geographical location.",
      "As the third-largest city in Maharashtra, it is projected to be one of the fastest-growing cities globally and serves as the winter capital of the state.",
    ],
    fun_fact: [
      "Nagpur is one of the key locations for the Dalit Buddhist movement, holding significant historical and cultural relevance.",
      "The city is part of the Smart Cities Project in India, aiming to improve urban infrastructure and quality of life.",
    ],
    trivia: [
      "Nagpur's geographical centrality makes it a pivotal point for the transportation network across India.",
      "The city hosts the annual winter session of the Maharashtra state assembly, making it an essential political hub.",
    ],
  },
  {
    city: "Tel Aviv-Yafo",
    country: "Israel",
    clues: [
      "This city is known as a global high tech hub and serves as the economic heart of a country located on the eastern shore of the Mediterranean Sea.",
      "With a vibrant nightlife and beautiful beachfront, this city is often associated with its historical counterpart, which has a prominent harbor and ancient architecture.",
    ],
    fun_fact: [
      "Tel Aviv is famous for its Bauhaus architecture and is designated as a UNESCO World Heritage Site.",
      "It ranks as one of the top cities in the world for innovation and startups, earning the nickname 'Startup City.'",
    ],
    trivia: [
      "The city is divided into two main parts: Tel Aviv, which is modern and bustling, and Jaffa (Yafo), known for its ancient port and historical significance.",
      "Tel Aviv hosts the annual White Night Festival, during which the city celebrates its cultural and artistic scene with events that last all night.",
    ],
  },
  {
    city: "Chicago",
    country: "United States",
    clues: [
      "This city is home to the famous deep-dish pizza and a historic waterfront along the shores of a Great Lake.",
      "Known for its stunning skyline, this city was the birthplace of the skyscraper and has a rich history intertwined with the Great Chicago Fire.",
    ],
    fun_fact: [
      "Chicago is often referred to as 'The Windy City', a nickname that is thought to refer to the city's weather as well as its politicians.",
      "The city hosts the annual Taste of Chicago festival, which is the largest food festival in the world, celebrating the city's diverse culinary scene.",
    ],
    trivia: [
      "Chicago is the location of the first Ferris wheel, which was built in 1893 for the World's Columbian Exposition.",
      "The city's public art collection is extensive, featuring pieces like the iconic Cloud Gate sculpture, commonly known as 'The Bean'.",
    ],
  },
  {
    city: "Recife",
    country: "Brazil",
    clues: [
      "This vibrant city, known as the Venice of Brazil, features an intricate network of waterways and is famous for its carnival celebrations.",
      "Once a colonial capital for the Dutch, this city is located at the confluence of two rivers before they flow into the Atlantic Ocean.",
    ],
    fun_fact: [
      "Recife is home to one of the largest urban populations in Brazil, making it a significant cultural and economic hub in the northeast.",
      "The city's name refers to the reefs found off its coastline, which add to its picturesque landscape.",
    ],
    trivia: [
      "Recife hosted the first-ever Carnival celebration in Brazil, which has now become a hallmark of Brazilian culture.",
      "The architecture of Recife features a mix of modern and colonial buildings, reflecting its rich history and cultural influences.",
    ],
  },
  {
    city: "Beijing",
    country: "China",
    clues: [
      "This city, known for its rich history, is home to a famous wall that stretches over 13,000 miles, originally built to protect against invasions.",
      "As the political and cultural capital of its country, this city boasts an iconic palace complex that served as the home to emperors for nearly 500 years.",
    ],
    fun_fact: [
      "Beijing is home to the world's largest square, Tiananmen Square, which serves as the site for various important events and gatherings.",
      "The city has a unique blend of traditional and modern architecture, exemplified by structures like the ancient Forbidden City and the contemporary Bird's Nest stadium.",
    ],
    trivia: [
      "Beijing hosts the annual Beijing International Film Festival, attracting filmmakers and film enthusiasts from around the globe.",
      "The city regularly experiences severe air pollution, leading it to implement various measures to improve air quality, especially before major events like the Olympics.",
    ],
  },
  {
    city: "Shenyeng",
    country: "China",
    clues: [
      "This city is known for being the capital of Liaoning Province and has a rich history that dates back to the Jin Dynasty.",
      "A prominent feature of this city is its famous 'Shenyang Imperial Palace,' which is a UNESCO World Heritage site and resembles its more famous counterpart in Beijing.",
    ],
    fun_fact: [
      "Shenyang is a major industrial city and is often referred to as the 'biggest city in Northeast China.'",
      "The city is home to the largest collection of preserved Manchu architecture in China, reflecting its historical significance.",
    ],
    trivia: [
      "Shenyang hosts the annual Shenyang International Auto Expo, attracting automotive industry professionals from around the world.",
      "The city was formerly known as Mukden and played a crucial role during the Second Sino-Japanese War.",
    ],
  },
  {
    city: "Houston",
    country: "United States",
    clues: [
      "This city is known as the 'Space City' because it is home to NASA's Johnson Space Center.",
      "It boasts a diverse culinary scene, particularly famous for its Tex-Mex and barbecue offerings.",
    ],
    fun_fact: [
      "Houston has a larger land area than both the states of Rhode Island and Delaware.",
      "The city is named after Sam Houston, a key figure in Texas history and a former president of the Republic of Texas.",
    ],
    trivia: [
      "Houston is recognized as the most ethnically diverse city in the United States.",
      "The city hosts the world's largest medical center, the Texas Medical Center, which includes over 61 institutions.",
    ],
  },
  {
    city: "Zhangzhou",
    country: "China",
    clues: [
      "This city is located in the southeastern corner of Fujian Province and is known for its proximity to the Taiwan Strait.",
      "It shares its prefecture with Xiamen and has a rich cultural history, particularly in traditional Chinese arts and crafts.",
    ],
    fun_fact: [
      "Zhangzhou is famous for its unique local cuisine, which includes popular dishes like 'Zhangzhou rice noodles' and 'eighteen smells' tea.",
      "The city is home to several historic temples and cultural landmarks, including the notable Nanshan Temple.",
    ],
    trivia: [
      "Zhangzhou is recognized for its beautiful landscape, which features a mix of hills, rivers, and coastline along the strait.",
      "The city hosts the Zhangzhou International Orchid Show, showcasing the region's rich agricultural contributions.",
    ],
  },
  {
    city: "Lisbon",
    country: "Portugal",
    clues: [
      "This city is known for its iconic yellow trams and stunning views over the River Tagus.",
      "As the westernmost capital city in mainland Europe, it boasts a rich history that dates back to ancient civilizations.",
    ],
    fun_fact: [
      "Lisbon is one of the oldest cities in the world, believed to have been settled by pre-Celtic tribes long before the rise of Rome.",
      "The Portuguese Riviera, part of the Lisbon metropolitan area, contains Cabo da Roca, the westernmost point of mainland Europe.",
    ],
    trivia: [
      "Julius Caesar named the city 'Felicitas Julia' during the Roman period, reflecting its importance in the ancient world.",
      "This city is famous for its azulejos, decorative ceramic tiles that adorn many buildings and streets, showcasing intricate designs and cultural heritage.",
    ],
  },
  {
    city: "Yantai",
    country: "China",
    clues: [
      "This city, known for its beautiful coastal scenery, is located on the southern shores of the Bohai Strait and serves as a crucial fishing seaport.",
      "Historically referred to as Chefoo, this city is bordered by Qingdao and Weihai and is a significant gateway to both the Bohai Sea and the Yellow Sea.",
    ],
    fun_fact: [
      "Yantai is famous for its production of fine wines, with a number of vineyards and wineries that contribute to its reputation as the 'California of China.'",
      "The city hosts an annual international sea festival that celebrates maritime culture, featuring a variety of water-related activities and performances.",
    ],
    trivia: [
      "Yantai's urban population is over 3 million, concentrated in five urban districts, making it a bustling hub of activity.",
      "The region is renowned for its diverse marine life and fishing industry, contributing significantly to the local economy and cuisine.",
    ],
  },
  {
    city: "Haora",
    country: "India",
    clues: [
      "This city serves as a gateway to its twin, which is one of India's largest metropolitan areas.",
      "Known for its iconic bridge that spans a major river, this city is an important transportation hub in West Bengal.",
    ],
    fun_fact: [
      "The city is home to one of the busiest railway stations in India, handling a massive volume of train traffic.",
      "Howrah Bridge, a cantilever bridge, is one of the largest of its kind in the world and has become an iconic symbol of the city.",
    ],
    trivia: [
      "Howrah is the headquarters of the Howrah district and plays a vital role in the local economy with its diverse industrial base.",
      "The Hooghly River on which it lies has significant cultural and historical importance for the regions it traverses.",
    ],
  },
  {
    city: "Barcelona",
    country: "Spain",
    clues: [
      "This city is famous for its unique architectural style, with works by a renowned Catalan architect who designed a basilica that has been under construction since 1882.",
      "Located on the northeastern coast of Spain, this city is known for its vibrant culture, beautiful beaches, and is the capital of an autonomous community that has its own distinct language.",
    ],
    fun_fact: [
      "Barcelona is home to one of the largest urban parks in Europe, Park Guell, which was also designed by the same architect associated with the basilica.",
      "The city has a rich history that dates back to Roman times, with well-preserved ancient ruins still visible in its layout today.",
    ],
    trivia: [
      "Barcelona's official languages are Catalan and Spanish, with Catalan being a key part of its cultural identity.",
      "The city hosted the Summer Olympics in 1992, which led to a significant transformation and modernization of its infrastructure.",
    ],
  },
  {
    city: "Naples",
    country: "Italy",
    clues: [
      "This vibrant Italian city is known for its historic ties to ancient Greece and is famous for its delicious culinary offerings, particularly a certain type of pizza.",
      "With a population of over 3 million in its metropolitan area, this city boasts stunning views of a famous volcano that poses a constant reminder of its fiery past.",
    ],
    fun_fact: [
      "Naples is one of the oldest continuously inhabited cities in the world, with roots tracing back to the Greek colony of Parthenope.",
      "This city is home to the world's first known pizzeria, which opened its doors in 1830 and still operates today.",
    ],
    trivia: [
      "Naples serves as the headquarters for NATO's Allied Joint Force Command.",
      "It is renowned for its vibrant arts scene and is the birthplace of famous figures such as the composer Giuseppe Verdi and the artist Caravaggio.",
    ],
  },
  {
    city: "Los Angeles",
    country: "United States",
    clues: [
      "This city is known as the entertainment capital of the world, home to numerous film studios and the iconic Hollywood sign.",
      "With a culturally diverse population, this city boasts a vibrant arts scene and is a major hub for music, fashion, and technology.",
    ],
    fun_fact: [
      "The city has a Mediterranean climate, characterized by warm, dry summers and mild, wet winters.",
      "Los Angeles is home to the largest municipal park in the United States, Griffith Park, which offers hiking, biking, and stunning views of the city.",
    ],
    trivia: [
      "The city was founded in 1781 and is named after the Spanish phrase 'El Pueblo de Nuestra Señora la Reina de los Ángeles' which means 'The Town of Our Lady the Queen of Angels.'",
      "Los Angeles hosts the largest number of museums and theatre companies in the country, including the renowned Getty Center and the Los Angeles County Museum of Art (LACMA).",
    ],
  },
  {
    city: "Bangalore",
    country: "India",
    clues: [
      "This city is often referred to as India's 'Garden City' due to its numerous parks and greenery.",
      "Once known as Bangalore, this city serves as the capital of the southern Indian state of Karnataka.",
    ],
    fun_fact: [
      "The city has a population of over 8 million, making it the third most populous city in India.",
      "Bengaluru is located at an altitude of 900 meters (3,000 feet) above sea level.",
    ],
    trivia: [
      "The earliest mention of its name, 'Bengalooru,' dates back to a Kannada stone inscription from 890 CE.",
      "Archaeological evidence suggests that human settlement in the region dates back to around 4000 BCE.",
    ],
  },
  {
    city: "Harbin",
    country: "China",
    clues: [
      "Known as the 'Ice City,' this city hosts a stunning annual ice festival that showcases elaborate ice sculptures and artworks.",
      "Located in Northeast China, this city is home to a famous architectural style influenced by Russian culture, evident in its central square.",
    ],
    fun_fact: [
      "Harbin is the capital of Heilongjiang province and is considered one of the largest cities in Northeast China.",
      "The city's name is derived from a word meaning 'swan' in the Jurchen language, reflecting its ties to local culture and natural beauty.",
    ],
    trivia: [
      "During the winter months, Harbin experiences temperatures that can drop as low as -30°C (-22°F), making it one of the coldest cities in China.",
      "The Harbin International Ice and Snow Sculpture Festival is one of the largest and most elaborate ice festivals in the world, attracting millions of visitors each year.",
    ],
  },
  {
    city: "Montréal",
    country: "Canada",
    clues: [
      "This city is known for its vibrant festivals and diverse cultural scene, including the famous Montreal International Jazz Festival.",
      "Nestled around a triple-peaked mountain, this city was originally founded as 'City of Mary' and is renowned for its French-speaking population.",
    ],
    fun_fact: [
      "Montreal is home to the largest underground city in the world, which spans over 33 km (20 miles) of interconnected complexes.",
      "The city has hosted the Summer Olympics in 1976, which were notable for their unique architecture and significant international participation.",
    ],
    trivia: [
      "Montreal's Mount Royal park was designed by Frederick Law Olmsted, who also co-designed New York City's Central Park.",
      "This city has a unique culinary scene, famous for its bagels, poutine, and smoked meat, attracting food enthusiasts from around the globe.",
    ],
  },
  {
    city: "Kaohsiung",
    country: "Taiwan",
    clues: [
      "This city, founded in the 17th century, evolved from a small trading village into a major political and economic hub in southern Taiwan.",
      "Home to the largest and busiest harbor in Taiwan, this city plays a critical role in the nation's shipping and transport industry.",
    ],
    fun_fact: [
      "Kaohsiung is classified as a 'Gamma −' level global city, highlighting its significance in global connectivity.",
      "The city boasts a diverse landscape that includes coastal urban areas as well as the scenic Yushan Range.",
    ],
    trivia: [
      "More than 67% of Taiwan's international freight passes through the Port of Kaohsiung, underscoring its importance in trade.",
      "Kaohsiung has a population of approximately 2.73 million, making it Taiwan's third most populous city.",
    ],
  },
  {
    city: "Aleppo",
    country: "Syria",
    clues: [
      "This ancient city has been inhabited for over 6,000 years and played a vital role in various civilizations throughout history.",
      "Known for its historic markets and citadel, this city once served as a major trade hub in the Levant region.",
    ],
    fun_fact: [
      "Aleppo is home to one of the oldest and most famous souks (markets) in the region, renowned for its craftsmanship.",
      "The city has produced a unique type of soap, traditionally known as 'Aleppo soap,' made with olive oil and laurel oil.",
    ],
    trivia: [
      "Aleppo was once the largest city in Syria before being surpassed by the capital, Damascus.",
      "The city's history is mentioned in cuneiform tablets dating back to the third millennium BC, highlighting its commercial and military significance.",
    ],
  },
  {
    city: "Algiers",
    country: "Algeria",
    clues: [
      "This city is known for its stunning Mediterranean coastline and a rich history influenced by both Ottoman and French cultures.",
      "Home to over 4 million residents, it is often referred to as one of the largest cities in North Africa, and it is a hub of diversity and cultural exchange.",
    ],
    fun_fact: [
      "Algiers was founded in 972 AD and has roots tracing back to ancient Phoenician trade settlements.",
      "The city is located along the Bay of Algiers, surrounded by the scenic Mitidja Plain and mountain ranges.",
    ],
    trivia: [
      "It is the capital city of Algeria and serves as the largest urban center in the country.",
      "Algiers is the third largest city on the Mediterranean Sea, following cities like Istanbul and Alexandria.",
    ],
  },
  {
    city: "Jinan",
    country: "China",
    clues: [
      "This city is known as the 'City of Springs,' famous for its 72 artesian springs that attract many visitors.",
      "As the capital of a major Chinese province, this city boasts a rich historical significance and is a hub for scientific research.",
    ],
    fun_fact: [
      "The city has been a significant administrative center since ancient times and continues to play an important role in transportation and economics.",
      "Jinan is ranked among the top 35 cities worldwide for scientific research, hosting several notable universities.",
    ],
    trivia: [
      "Jinan has a population of approximately 9.2 million, making it one of the largest cities in Shandong province.",
      "The city was granted sub-provincial administrative status in 1994, indicating its importance within the region.",
    ],
  },
  {
    city: "Melbourne",
    country: "Australia",
    clues: [
      "This city is known for its vibrant arts scene and hosts the annual Melbourne International Comedy Festival.",
      "It is often referred to as the cultural capital of Australia and features a mix of modern architecture and historical buildings.",
    ],
    fun_fact: [
      "Melbourne is home to the world's largest urban tram network.",
      "The city experiences a unique weather pattern dubbed 'four seasons in one day' due to its unpredictable climate.",
    ],
    trivia: [
      "The Melbourne Cricket Ground, one of the most famous sports stadiums in the world, is located here.",
      "Melbourne was originally founded in 1835 and was named after the British Prime Minister, William Lamb, 2nd Viscount Melbourne.",
    ],
  },
  {
    city: "Ahmedabad",
    country: "India",
    clues: [
      "This city is known as the 'Manchester of India' due to its thriving cotton industry.",
      "It serves as the administrative headquarters of a state capital and is located along the banks of a river.",
    ],
    fun_fact: [
      "Ahmedabad is the fifth-most populous city in India, with an estimated population of over 8.8 million in 2024.",
      "It was the first city in India to be declared a UNESCO World Heritage City in 2017.",
    ],
    trivia: [
      "The Sabarmati Ashram, an important site in India's struggle for independence, is located here.",
      "The city is known for its unique blend of modern architecture and historic sites, such as the Sidi Saiyyed Mosque.",
    ],
  },
  {
    city: "Nanning",
    country: "China",
    clues: [
      "This city is known as the 'Green City' due to its lush subtropical environment and is situated in the Guangxi Zhuang Autonomous Region.",
      "As a significant economic and cultural center in southern China, this city serves as a gateway for collaboration between China and ASEAN nations.",
    ],
    fun_fact: [
      "Nanning has been recognized as one of the top 200 science cities globally based on research outputs as of 2024.",
      "The city is home to People's Park, which is centrally located and serves as a popular recreational space for residents and visitors alike.",
    ],
    trivia: [
      "Nanning has a warm, monsoon-influenced humid subtropical climate, which contributes to its vibrant greenery.",
      "The city plays a key role in the training and cultural preservation of the Zhuang minority, who are an indigenous ethnic group in Guangxi.",
    ],
  },
  {
    city: "Nanjing",
    country: "China",
    clues: [
      "This city has been the capital for multiple Chinese dynasties and has a rich historical legacy stretching back to the 3rd century.",
      "Located in the Yangtze River Delta, it is one of the largest inland ports in the world and is known for its pivotal role in Chinese culture and education.",
    ],
    fun_fact: [
      "Nanjing was home to the Ming dynasty's capital and is renowned for its historical sites, including the Nanjing Ming City Wall.",
      "This city has been recognized with multiple awards, including a Special UN Habitat Scroll of Honor for its efforts in urban development and sustainability.",
    ],
    trivia: [
      "Nanjing has a population of over 9 million people, making it one of the most populous cities in China.",
      "The city also hosts one of China's oldest universities, Nanjing University, which was established in 1902.",
    ],
  },
  {
    city: "St. Petersburg",
    country: "Russia",
    clues: [
      "This city was founded by Peter the Great in 1703 and is located at the head of the Gulf of Finland.",
      "Once the capital of Imperial Russia, this city is known for its stunning canals and is often referred to as the 'Venice of the North.'",
    ],
    fun_fact: [
      "The city served as the capital of Russia for over two centuries before the capital moved back to Moscow in 1918.",
      "Saint Petersburg is renowned for its white nights, a phenomenon where the sun doesn't completely set during summer months, creating prolonged twilight.",
    ],
    trivia: [
      "This city is home to the Hermitage Museum, one of the largest and oldest museums in the world, housing millions of works of art.",
      "Saint Petersburg has a unique system of bridges, with over 800 bridges spanning its rivers and canals, making it a picturesque place.",
    ],
  },
  {
    city: "Durban",
    country: "South Africa",
    clues: [
      "This city is known for being the busiest port in sub-Saharan Africa and has a major coastal location along the Indian Ocean.",
      "Home to a significant population of nearly 600,000 within its city limits, this South African city offers a humid subtropical climate with warm summers and mild winters.",
    ],
    fun_fact: [
      "Durban is often referred to by its Zulu name, eThekwini, which translates to 'the bay' or 'the lagoon'.",
      "The city has a rich cultural mix, heavily influenced by its historical ties with Indian and Zulu communities.",
    ],
    trivia: [
      "Durban has a famous beachfront known as the Golden Mile, attracting both tourists and locals.",
      "The nearby Umgeni River offers picturesque views and recreational activities, contributing to the city's natural beauty.",
    ],
  },
  {
    city: "Tampa",
    country: "United States",
    clues: [
      "This city was founded as a military center and is now known for its vibrant culture rooted in the cigar industry.",
      "Located on the Gulf Coast of Florida, it boasts the largest port in the state and a thriving tourism sector.",
    ],
    fun_fact: [
      "Tampa is home to the annual Gasparilla Pirate Festival, celebrating the city's pirate history and featuring a crew of 'pirates' invading the city.",
      "The iconic Busch Gardens amusement park in Tampa combines thrilling rides with a zoo showcasing exotic animals.",
    ],
    trivia: [
      "Tampa Bay is known for its diverse range of sports teams, including the NFL's Buccaneers and NHL's Lightning.",
      "The city’s name is believed to derive from the native Calusa word 'tampa' referring to 'sticks of fire' which could refer to the area's lightning storms.",
    ],
  },
  {
    city: "Quezon City",
    country: "Philippines",
    clues: [
      "This city was specifically created as a response to the overcrowding issues of its older counterpart, intended to be the new capital of the Philippines.",
      "It shares its name with a significant historical figure who was the second president of the Philippines and is known for his contributions to the country's independence.",
    ],
    fun_fact: [
      "Quezon City is the most populous city in the Philippines, housing nearly 3 million residents as of the 2020 census.",
      "The city hosts the largest shopping mall in the Philippines, which is also one of the largest malls in the world.",
    ],
    trivia: [
      "Quezon City was officially declared the national capital on October 12, 1949, a decade after it was founded.",
      "Several government agencies relocated from Manila to this city, marking a significant administrative shift within the Philippines.",
    ],
  },
  {
    city: "San Diego",
    country: "United States",
    clues: [
      "This city is known as the Birthplace of California and was the first site on the West Coast settled by Europeans.",
      "Home to a major U.S. naval base, this city enjoys a mild climate and is famous for its extensive coastline and parks.",
    ],
    fun_fact: [
      "San Diego has more than 70 miles of coastline, making it a popular destination for beachgoers and surfers.",
      "The city hosts one of the largest comic book conventions in the world, known as San Diego Comic-Con.",
    ],
    trivia: [
      "San Diego's Balboa Park is home to more than 16 museums, gardens, and the famous San Diego Zoo.",
      "The city was named after Saint Didacus, a Spanish saint known as San Diego in Spanish.",
    ],
  },
  {
    city: "Ōsaka",
    country: "Japan",
    clues: [
      "This city is known as Japan's economic hub and has been a crucial port since ancient times.",
      "It briefly served as Japan's imperial capital during the 7th and 8th centuries and is part of the second-largest metropolitan area in the country.",
    ],
    fun_fact: [
      "Osaka is home to the famous Universal Studios theme park and offers a unique blend of modern attractions and historical sites.",
      "The city is famous for its street food, including delicious dishes like takoyaki and okonomiyaki.",
    ],
    trivia: [
      "Osaka Bay was historically known as a significant trade route and has influenced the city's growth as an economic center.",
      "The Osaka Castle, a historic landmark, was constructed in the 16th century and played a major role in the unification of Japan during the Azuchi-Momoyama period.",
    ],
  },
  {
    city: "İzmir",
    country: "Turkey",
    clues: [
      "This city, located on the Aegean coast, has a history that stretches back over 3,000 years and was known as Smyrna in ancient times.",
      "It is the third most populous city in Turkey and serves as the capital of its province, boasting a vibrant waterfront and a rich cultural heritage.",
    ],
    fun_fact: [
      "İzmir is known for its historical sites, including the ancient city of Ephesus nearby, which is one of the best-preserved ancient cities in the Mediterranean.",
      "The city's annual İzmir International Fair, one of the oldest trade fairs in the world, showcases its ongoing significance in commerce and culture.",
    ],
    trivia: [
      "The Gulf of İzmir is a significant geographical feature, with the city extending inland across a delta and along an alluvial plain.",
      "İzmir has a diverse population and is renowned for its liberal and welcoming atmosphere, often considered one of the most progressive cities in Turkey.",
    ],
  },
  {
    city: "Xiamen",
    country: "China",
    clues: [
      "This city, located beside the Taiwan Strait, is known for its beautiful coastal scenery and affluent areas.",
      "Famous for its unique blend of cultures, this city was one of the first special economic zones in China, playing a significant role in the country's reform and opening up.",
    ],
    fun_fact: [
      "Xiamen is home to the picturesque Gulangyu Island, a UNESCO World Heritage site renowned for its colonial architecture and musical history.",
      "The city hosts the annual Xiamen International Marathon, which attracts runners from around the world and is celebrated for its scenic route along the coast.",
    ],
    trivia: [
      "The Kinmen Islands, administered by Taiwan, are located less than 6 kilometers away from Xiamen, highlighting its historical significance in cross-strait relations.",
      "Xiamen was historically known as Amoy and was an important port city for trade, especially during the Qing Dynasty.",
    ],
  },
  {
    city: "Sapporo",
    country: "Japan",
    clues: [
      "This city is known for its annual snow festival, featuring impressive ice sculptures and attracting visitors from around the world.",
      "As the largest city in Hokkaido, this urban center was designed with a grid layout inspired by historical capitals in Japan.",
    ],
    fun_fact: [
      "Sapporo is home to the first beer brewery in Japan, established in 1876, which paved the way for the country's craft beer movement.",
      "The city is famous for its rich culinary scene, particularly for its miso ramen, as well as fresh seafood and dairy products due to its prime location.",
    ],
    trivia: [
      "Sapporo's name comes from the Ainu language, meaning 'the place where the rivers flow,' reflecting the area's indigenous heritage.",
      "The city has hosted the Winter Olympics in 1972, making it the first Asian city to host this prestigious event.",
    ],
  },
  {
    city: "Taiyuan",
    country: "China",
    clues: [
      "This city, known as Dragon City, has served as the capital for multiple Chinese dynasties throughout its extensive history.",
      "Situated in the heart of Shanxi Province, this city's economy is heavily based on energy and heavy chemical industries.",
    ],
    fun_fact: [
      "The city of Taiyuan is home to the Fen River, which flows through its center, adding to its historical significance.",
      "As of 2021, Taiyuan has a permanent population of over 5 million people, making it one of the major urban centers in the region.",
    ],
    trivia: [
      "Taiyuan was historically known for its role as a military and economic center, providing strategic importance to various rulers.",
      "The city is divided into 6 districts and 3 counties, reflecting its administrative significance in Shanxi Province.",
    ],
  },
  {
    city: "Sydney",
    country: "Australia",
    clues: [
      "This city boasts a world-famous opera house that features unique sail-like architecture and is situated right by a stunning harbor.",
      "Often referred to as the 'Harbour City', this metropolitan area serves as the capital of New South Wales and is surrounded by beautiful national parks.",
    ],
    fun_fact: [
      "Sydney was the first location in Australia to host a modern Olympic Games, which took place in 2000.",
      "The city is known for its diverse population, with nearly one-third of its residents born overseas.",
    ],
    trivia: [
      "Sydney's iconic Bondi Beach is one of the most well-known beaches in the world, attracting millions of visitors each year.",
      "The Sydney Harbour Bridge, completed in 1932, is often referred to as 'The Coathanger' due to its distinctive shape.",
    ],
  },
  {
    city: "San Francisco",
    country: "United States",
    clues: [
      "This city is known for its iconic bridge that connects it to Marin County, often wrapped in fog.",
      "Home to a famous district characterized by its brightly painted Victorian houses, this city is also known for its steep hills.",
    ],
    fun_fact: [
      "San Francisco is the first major city in the United States to ban the sale of plastic water bottles in 2014.",
      "The city is home to one of the largest and oldest Chinatowns outside of Asia.",
    ],
    trivia: [
      "San Francisco has the highest per capita income among U.S. cities with over 250,000 residents.",
      "The city was founded in 1776 by Spanish colonists and was originally named 'Yerba Buena'.",
    ],
  },
  {
    city: "Tripoli",
    country: "Libya",
    clues: [
      "This city is the capital of a North African country and has a rich history influenced by ancient civilizations, including the Phoenicians and the Romans.",
      "Known for its Mediterranean coastline, this city is famous for its historic medina, where traditional markets thrive alongside modern developments.",
    ],
    fun_fact: [
      "Tripoli is home to the Arch of Marcus Aurelius, a Roman triumphal arch built during the reign of Emperor Marcus Aurelius in the 2nd century AD.",
      "The city features a unique blend of architectural styles, reflecting its diverse history, with examples ranging from Ottoman and Venetian influences to modernist designs.",
    ],
    trivia: [
      "The city's name, Tripoli, means 'three cities' in Greek, referring to the three towns that once made up the area.",
      "Tripoli has been an important trade hub in the Mediterranean due to its strategic location, serving as a gateway for goods coming to and from Europe and Africa.",
    ],
  },
  {
    city: "Minneapolis",
    country: "United States",
    clues: [
      "This city boasts thirteen lakes and is famous for its extensive park system, which is known as the 'City of Lakes.'",
      "Located near the eastern border of Minnesota, this city is part of a metropolitan area that shares its name with the state capital.",
    ],
    fun_fact: [
      "Minneapolis is built on an artesian aquifer, which contributes to its abundance of water and picturesque lakes.",
      "The city's public parks are connected by the Grand Rounds National Scenic Byway, making it a scenic route for outdoor enthusiasts.",
    ],
    trivia: [
      "Minneapolis is known for its cold, snowy winters and hot, humid summers, creating a diverse seasonal climate.",
      "The area is historically significant as the site of Native American habitation before European settlement, particularly by the Dakota people.",
    ],
  },
  {
    city: "Vienna",
    country: "Austria",
    clues: [
      "This city is known as the cultural and political heart of a country famous for its classical music and stunning palaces.",
      "Located along the Danube River, this city is both Austria's capital and its largest urban area, often associated with coffeehouses and imperial history.",
    ],
    fun_fact: [
      "Vienna is home to more than 100 museums, including the renowned Kunsthistorisches Museum and the Belvedere Palace, which houses works by Gustav Klimt.",
      "The Vienna State Opera is considered one of the leading opera houses in the world and hosts a major event known as the Vienna Opera Ball each year.",
    ],
    trivia: [
      "The city has a unique public transport system, including a network of trams that are famous for their efficiency and coverage.",
      "Vienna was the host city for several important international organizations, including the United Nations and the Organization of the Petroleum Exporting Countries (OPEC).",
    ],
  },
  {
    city: "Puebla",
    country: "Mexico",
    clues: [
      "This city, founded by the Spanish in 1531, was strategically located on the trade route between Mexico City and the port of Veracruz.",
      "Famous for its colorful talavera pottery and unique mole poblano, this city is also the capital of a state that shares its name.",
    ],
    fun_fact: [
      "The city is known as the birthplace of the Cinco de Mayo celebration, commemorating the Battle of Puebla in 1862.",
      "It is home to one of the largest cathedrals in Mexico, featuring a stunning baroque style that took over 200 years to complete.",
    ],
    trivia: [
      "Puebla is recognized as a UNESCO World Heritage Site due to its well-preserved colonial architecture.",
      "The city's historical area boasts over 70 bright and colorful murals that reflect its rich cultural heritage.",
    ],
  },
  {
    city: "Campinas",
    country: "Brazil",
    clues: [
      "This Brazilian city is known for being the largest outside of a state capital's metropolitan area, making it a key urban center.",
      "Located in the state of São Paulo, this city has a name that translates to 'plains' or 'meadows' in English.",
    ],
    fun_fact: [
      "The city has a population exceeding 1.1 million, ranking it as the fourteenth most populous city in Brazil.",
      "Campinas is part of a larger metropolitan area that encompasses twenty municipalities, with a combined population of over 3.6 million.",
    ],
    trivia: [
      "It is known for its rich history in coffee production, often referred to as the ‘Coffee Capital’ of Brazil in the past.",
      "The city is home to one of Brazil's oldest universities, the State University of Campinas (UNICAMP), which is recognized for its research and innovation.",
    ],
  },
  {
    city: "Belo Horizonte",
    country: "Brazil",
    clues: [
      "This city, known for its blend of modern and classical architecture, was planned in the 1890s to become the capital of a Brazilian state.",
      "Located in the southeastern region of Brazil, this city is famous for its sophisticated cuisine and is often referred to as the 'Gastronomic Capital' of the country.",
    ],
    fun_fact: [
      "Belo Horizonte was the first planned modern city in Brazil, and its layout was designed with wide avenues and green spaces.",
      "The Pampulha Complex, a major architectural landmark in the city, features the works of the famous Brazilian architect Oscar Niemeyer.",
    ],
    trivia: [
      "The city's name translates to 'Beautiful Horizon' in English, reflecting its picturesque landscape surrounded by mountains.",
      "Belo Horizonte is home to one of the largest urban parks in Brazil, Parque das Mangabeiras, which offers stunning views of the city.",
    ],
  },
  {
    city: "Manila",
    country: "Philippines",
    clues: [
      "This city is known for being the world’s most densely populated city proper, with a unique blend of historical sites and vibrant urban life.",
      "Located on the eastern shore of a bay that shares its name, this capital city has a rich colonial heritage and plays a significant role in Southeast Asia's economy.",
    ],
    fun_fact: [
      "Manila was the first chartered city in the Philippines, and its charter was established by an act of the Philippine Commission in 1901.",
      "The city’s name, 'Maynila', is derived from a local aquatic plant called 'Nilad', which was once abundant in the area.",
    ],
    trivia: [
      "Manila became autonomous in 1949 with the passage of a revised charter, known as Republic Act No. 409.",
      "It is part of the Metro Manila region, which includes 16 cities and is one of the most populous urban areas in the world.",
    ],
  },
  {
    city: "Xian",
    country: "China",
    clues: [
      "This city was a vital terminus of the ancient Silk Road and is known for its impressive Terracotta Army.",
      "Once known as Chang'an, this city has served as a capital for several major Chinese dynasties and is one of the Four Great Ancient Capitals of China.",
    ],
    fun_fact: [
      "Xi'an was the starting point of the Silk Road, opening trade routes between China and the West.",
      "The city is home to one of the oldest and most complete city walls in China, which dates back to the Ming Dynasty.",
    ],
    trivia: [
      "The population of Xi'an is approximately 12.95 million, making it the third-most populous city in Western China.",
      "Xi'an is recognized as a UNESCO World Heritage Site, along with the Terracotta Army and is a major tourist destination in China.",
    ],
  },
  {
    city: "Baltimore",
    country: "United States",
    clues: [
      "This city is known for its vibrant Inner Harbor and rich maritime history, which played a significant role during the War of 1812.",
      "Home to a famous sports team known as the Orioles, this city is also celebrated for a unique national dish often associated with its blue crabs.",
    ],
    fun_fact: [
      "Baltimore is the most populous independent city in the United States, meaning it is not part of any county.",
      "The Baltimore metropolitan area is home to nearly 2.8 million people, making it one of the largest metropolitan regions in the country.",
    ],
    trivia: [
      "The city's nickname is 'Charm City,' which reflects its appeal and friendly atmosphere.",
      "Baltimore is the birthplace of the national anthem, 'The Star-Spangled Banner,' written by Francis Scott Key.",
    ],
  },
  {
    city: "Sendai",
    country: "Japan",
    clues: [
      "This city, often referred to as the 'City of Trees', is known for its beautiful avenues lined with zelkova trees.",
      "It is home to Japan's largest Tanabata festival, celebrated annually during the summer, and features a winter illumination event called the Pageant of Starlight.",
    ],
    fun_fact: [
      "Founded in 1600 by the powerful daimyō Date Masamune, this city has a rich historical background.",
      "The city suffered significant damage during the 2011 Tōhoku earthquake and tsunami, but it has since been rebuilding and revitalizing.",
    ],
    trivia: [
      "Sendai is the largest city in the Tōhoku region and ranks as the twelfth most populated city in Japan as of August 2023.",
      "Tohoku University, one of Japan's prestigious former Imperial Universities, is located in this city, known for its strong emphasis on research and education.",
    ],
  },
  {
    city: "Wenzhou",
    country: "China",
    clues: [
      "This city, located in the southeastern part of Zhejiang province, is renowned for its mountainous terrain and beautiful islands along the East China Sea.",
      "Historically a significant foreign treaty port, this city boasts a unique blend of mountainous landscapes and rich maritime culture.",
    ],
    fun_fact: [
      "The area of Wenzhou consists of approximately 70% mountains, 20% farmland, and 10% water, making it a diverse geographic region.",
      "At the time of the 2010 census, Wenzhou's urban population was over 3 million, with a significant portion of residents hailing from outside the city.",
    ],
    trivia: [
      "The city's historical name, Yungkia, signifies its past as a prosperous trading hub during the 19th century.",
      "Wenzhou is known for its strong entrepreneurial spirit, producing a significant number of private enterprises and a large diaspora around the world.",
    ],
  },
  {
    city: "Nairobi",
    country: "Kenya",
    clues: [
      "This city is known as the 'Green City in the Sun' and is home to a national park that allows visitors to see wildlife just minutes away from an urban center.",
      "The city's name is derived from a local Maasai phrase that translates to 'place of cool waters', referring to a river that runs through it.",
    ],
    fun_fact: [
      "Nairobi is not only the capital of Kenya but also serves as a hub for international organizations, including major United Nations offices.",
      "The Nairobi Securities Exchange is one of the largest and most significant stock exchanges in Africa, capable of handling millions of trades daily.",
    ],
    trivia: [
      "Nairobi is home to the Nairobi National Park, which is unique for being a wildlife reserve located within a major city.",
      "In 2010, Nairobi was designated as a UNESCO Global Network of Learning Cities, highlighting its commitment to education and community development.",
    ],
  },
  {
    city: "Vancouver",
    country: "Canada",
    clues: [
      "This city is located in the picturesque region known as the Lower Mainland, surrounded by mountains and ocean.",
      "With a diverse population, nearly half of the residents speak a language other than English at home.",
    ],
    fun_fact: [
      "Vancouver is the most populous city in British Columbia and ranks as the third-largest metropolitan area in Canada.",
      "The city is known for its stunning natural scenery, which includes both mountains and waterfront, making it a hub for outdoor activities.",
    ],
    trivia: [
      "Vancouver has the highest population density in Canada, with over 5,700 people living per square kilometer.",
      "It is often ranked as one of the most livable cities in the world, thanks to its quality of life, environmental sustainability, and cultural diversity.",
    ],
  },
  {
    city: "Ibadan",
    country: "Nigeria",
    clues: [
      "This city is the capital of Oyo State and was once the largest city in Nigeria at the time of the country’s independence.",
      "Known for its significant history, this city has the largest geographical area of any city in Nigeria.",
    ],
    fun_fact: [
      "Ibadan is recognized as one of the fastest-growing cities in sub-Saharan Africa according to the UN.",
      "It ranks third in West Africa for tech startups, showcasing a burgeoning tech scene.",
    ],
    trivia: [
      "As of 2021, Ibadan has a population of approximately 3.6 million, making it the third-largest city in Nigeria.",
      "In 2016, Ibadan became a member of the UNESCO Global Network of Learning Cities.",
    ],
  },
  {
    city: "Wuhan",
    country: "China",
    clues: [
      "This city is known as the 'Nine Provinces' Thoroughfare' due to its strategic location at the confluence of two major rivers.",
      "It was the site of a significant uprising in 1911 that played a crucial role in ending over two millennia of dynastic rule in China.",
    ],
    fun_fact: [
      "Wuhan is home to over eleven million residents, making it the most populous city in Hubei province.",
      "Historically, Wuhan was a vital trading port and a focal point for commerce in China.",
    ],
    trivia: [
      "The city's name is derived from the combination of three towns: Wuchang, Hankou, and Hanyang, referred to as the 'Three Towns of Wuhan.'",
      "Wuhan was briefly the capital of China during two notable periods in the 20th century: once in 1927 and again during the Second Sino-Japanese War in 1937.",
    ],
  },
  {
    city: "New York",
    country: "United States",
    clues: [
      "This city is known as 'The Big Apple' and is famous for its skyline, featuring iconic structures like the Empire State Building.",
      "The city is home to a world-renowned park in the middle of its urban landscape, offering a green oasis amidst the hustle and bustle.",
    ],
    fun_fact: [
      "Approximately 800 languages are spoken in this city, making it the most linguistically diverse city in the world.",
      "This city has more than 27,000 acres of parkland, making it a prominent destination for those who enjoy outdoor recreation.",
    ],
    trivia: [
      "The subway system in this city is one of the largest and busiest in the world, with over 472 stations.",
      "This city was the first capital of the United States after the Constitution was ratified in 1788.",
    ],
  },
  {
    city: "Havana",
    country: "Cuba",
    clues: [
      "This bustling capital city was once a major stop for Spanish galleons and is known for its rich colonial history.",
      "Home to the largest metropolitan area in the Caribbean, this city's iconic Malecón is famous for its scenic seaside promenade.",
    ],
    fun_fact: [
      "Havana was granted the title of capital by King Philip III of Spain in 1607, after being founded by the Spanish in the 16th century.",
      "The city has significant historical significance as a vital port and commercial center, and it is the seat of the Cuban government.",
    ],
    trivia: [
      "The official population of Havana was recorded as 1,814,207 inhabitants in 2023.",
      "Havana has a total area of 728.26 km2, making it the largest city by area in Cuba.",
    ],
  },
  {
    city: "Shijianzhuang",
    country: "China",
    clues: [
      "This capital city is known for its extensive flower market and serves as a hub for industry and commerce in northern China.",
      "It is located in the Hebei province and has a climate that is characterized by four distinct seasons, making it a popular location for agriculture.",
    ],
    fun_fact: [
      "Shijiazhuang has a rich history that dates back over 2,500 years, originally serving as a significant military and administrative center.",
      "The city features the unique Zhaozhou Bridge, the world's oldest stone arch bridge still in use, which dates back to the Sui Dynasty.",
    ],
    trivia: [
      "Shijiazhuang is often referred to as a ‘new city’ due to its rapid urbanization and development in the 20th century, transitioning from a small village to a major city.",
      "The city has a large population of over 10 million residents, making it one of the most populous cities in China.",
    ],
  },
  {
    city: "Kolkata",
    country: "India",
    clues: [
      "This city is known as the cultural capital of India and is home to numerous festivals celebrating art, literature, and music.",
      "The Howrah Bridge, a iconic symbol of this city, is one of the busiest bridges in the world and connects two sides of the Hooghly River.",
    ],
    fun_fact: [
      "Kolkata was the capital of India during British rule until 1911, before the capital was moved to Delhi.",
      "The city is famous for its distinctive sweet called 'rosogolla,' which originated here and is an integral part of Bengali cuisine.",
    ],
    trivia: [
      "Kolkata is home to the Indian Museum, the oldest and largest museum in India, which houses a vast collection of artifacts and specimens.",
      "The city hosts the Kolkata Book Fair, the largest literary festival in Asia, showcasing books from various genres and languages.",
    ],
  },
  {
    city: "Fortaleza",
    country: "Brazil",
    clues: [
      "This city, known for its beautiful beaches and vibrant culture, is located in the Northeast region of Brazil.",
      "It is the state capital of Ceará and was the first city in Brazil to have an international airport.",
    ],
    fun_fact: [
      "The city is a major industrial hub and home to Brazil's fourth largest economy.",
      "Fortaleza is part of the Mercosur trade bloc, making it a significant trade port for the region.",
    ],
    trivia: [
      "The BR-116, the main highway in Brazil, begins in this city.",
      "Fortaleza surpassed Salvador in population size according to the 2022 census.",
    ],
  },
  {
    city: "Medellín",
    country: "Colombia",
    clues: [
      "This city is known for its innovative urban transport system, including a cable car that connects its hilly neighborhoods to the city center.",
      "Nestled in a valley surrounded by mountains, it is recognized for its pleasant year-round climate, often referred to as the 'City of Eternal Spring'.",
    ],
    fun_fact: [
      "Medellín has transformed from a city with a troubled past into a cultural and innovation hub, hosting various technology and innovation events.",
      "The city's annual Feria de las Flores (Festival of Flowers) celebrates local culture and features a parade of flower-covered floats and traditional music.",
    ],
    trivia: [
      "Medellín is home to the famous Museum of Antioquia, which houses a large collection of works by renowned artist Fernando Botero.",
      "The city is also known for its vibrant street art, with numerous murals adorning buildings throughout the neighborhoods, reflecting local culture and history.",
    ],
  },
  {
    city: "Karachi",
    country: "Pakistan",
    clues: [
      "This city is located at the southern tip of Pakistan and is known for its vibrant coastal skyline along the Arabian Sea.",
      "Once the capital of Pakistan, it is now the largest city in the country and is known for its rich cultural diversity and economic significance.",
    ],
    fun_fact: [
      "Karachi is home to one of the world's largest deep-water ports, which plays a crucial role in international trade.",
      "The city has a thriving arts scene, including numerous galleries, theaters, and music festivals that celebrate various cultural influences.",
    ],
    trivia: [
      "The city's original name was Kolachi, founded as a fortified village in 1729.",
      "Karachi has its own unique food culture, with dishes such as biryani and karahi being famous across the region.",
    ],
  },
  {
    city: "Birmingham",
    country: "United Kingdom",
    clues: [
      "This city is often referred to as the 'second city' of the United Kingdom and is known for its vibrant cultural scene.",
      "Located in the West Midlands, it shares its name with a famous UK dish that includes a combination of meat and vegetables.",
    ],
    fun_fact: [
      "Birmingham is home to more miles of canals than Venice, with over 35 miles of waterways.",
      "The city is known as the birthplace of the Industrial Revolution, which dramatically changed manufacturing and production processes worldwide.",
    ],
    trivia: [
      "Birmingham has produced numerous notable figures, including J.R.R. Tolkien, the author of 'The Lord of the Rings', who spent his childhood there.",
      "The city features the largest public library in Europe, the Birmingham Library, which opened in 2013 and is known for its unique architectural design.",
    ],
  },
  {
    city: "Rome",
    country: "Italy",
    clues: [
      "This city is home to an independent country known for its religious significance and as the center of the Catholic Church.",
      "Known as the 'Eternal City', this location boasts ancient ruins, a significant historical legacy, and a distinct architectural style.",
    ],
    fun_fact: [
      "Rome is the only city in the world that has a country within its borders, which is Vatican City.",
      "The city's infrastructure includes over 2,500 years of history, making it a living museum filled with historic landmarks.",
    ],
    trivia: [
      "The Colosseum, one of Rome's most famous landmarks, could hold up to 80,000 spectators during ancient times.",
      "Rome was the first city to reach a population of 1 million people, achieving this remarkable milestone during the Roman Empire.",
    ],
  },
  {
    city: "Jeddah",
    country: "Saudi Arabia",
    clues: [
      "This city, located on the Red Sea, has been a crucial travel hub for Muslim pilgrims since the 7th century.",
      "Home to a famous floating mosque, this city is known for its rich history and vibrant commercial scene.",
    ],
    fun_fact: [
      "Jeddah is often referred to as the gateway to Mecca, accommodating millions of pilgrims each year.",
      "The city has the tallest building in Saudi Arabia, the Jeddah Tower, which is planned to reach a height of over 1,000 meters.",
    ],
    trivia: [
      "Jeddah's historical district, Al-Balad, is a UNESCO World Heritage Site, renowned for its unique architecture and historical significance.",
      "The city is famous for its Corniche, a waterfront area that features parks, sculptures, and beaches along the Red Sea.",
    ],
  },
  {
    city: "Tunis",
    country: "Tunisia",
    clues: [
      "This city is known for its Medina, a UNESCO World Heritage Site, and is often described as the gateway to the ancient ruins of a famous nearby civilization.",
      "You can stroll along a grand avenue reminiscent of the Parisian Champs-Élysées, where colonial architecture meets vibrant local culture.",
    ],
    fun_fact: [
      "The city was founded in the 9th century BC and has a rich history influenced by various civilizations, including the Phoenicians, Romans, and Ottomans.",
      "Tunis serves as a hub for cultural events, including the prestigious Tunis International Film Festival, which celebrates regional and international cinema.",
    ],
    trivia: [
      "Tunis is situated on the Gulf of Tunis and is adjacent to the ancient site of Carthage, which was once a powerful city-state in the Mediterranean.",
      "The greater metropolitan area of Tunis is home to approximately 2.7 million people, making it one of the largest cities in the Maghreb region.",
    ],
  },
  {
    city: "Washington",
    country: "United States",
    clues: [
      "This city is home to the iconic Lincoln Memorial and the United States Capitol.",
      "Often associated with the phrase 'the seat of the federal government,' this city is a hub for American politics.",
    ],
    fun_fact: [
      "The National Mall in this city is lined with numerous monuments and museums, many of which are part of the Smithsonian Institution.",
      "This city is unique in that it is not part of any state and operates under its own jurisdiction.",
    ],
    trivia: [
      "The city was named after George Washington, the first president of the United States.",
      "It has a population of over 700,000 residents, making it one of the largest cities in the United States.",
    ],
  },
  {
    city: "Santa Cruz",
    country: "Bolivia",
    clues: [
      "This city is known as the economic powerhouse of Bolivia, often referred to as the 'Santa Cruz de la Sierra' to differentiate it from the many other places with similar names.",
      "Located in a tropical region, this city's vibrant culture is a blend of indigenous traditions and influences from European immigrants.",
    ],
    fun_fact: [
      "Santa Cruz hosts one of the largest carnivals in Bolivia, showcasing colorful parades and traditional music that attract thousands of visitors each year.",
      "The city is strategically located along the Andean foothills, providing access to both tropical and mountain ecosystems, making it a biodiverse region.",
    ],
    trivia: [
      "In the early 20th century, Santa Cruz transitioned from a small town to a significant urban center due to the booming agricultural and natural gas industries.",
      "The city is home to the Lomas de Arena, a unique natural reserve featuring vast sand dunes that contrast with the surrounding rich green landscapes.",
    ],
  },
  {
    city: "Yokohama",
    country: "Japan",
    clues: [
      "This city is often described as Japan's gateway to the world, having opened its doors to international trade in the late 19th century.",
      "Home to one of the largest Chinatowns in the world, this city boasts a unique blend of Japanese and Chinese cultures.",
    ],
    fun_fact: [
      "Yokohama has the largest Chinatown in Japan, which is known for its vibrant streets filled with restaurants, shops, and festivals.",
      "This city features the iconic Landmark Tower, which was the tallest building in Japan when it was completed in 1993.",
    ],
    trivia: [
      "Yokohama is known for its beautiful waterfront area, known as the Minato Mirai 21, which includes shopping malls, parks, and attractions.",
      "In 1887, the first foreign school in Japan was established in Yokohama, highlighting its role as a center for international education.",
    ],
  },
  {
    city: "Buenos Aires",
    country: "Argentina",
    clues: [
      "This city is known for its vibrant tango culture, which is often performed in its historic neighborhoods.",
      "It is an autonomous district that became the capital of its country after the civil unrest of the 19th century.",
    ],
    fun_fact: [
      "Buenos Aires is home to one of the largest shopping streets in the world, Avenida Santa Fe, which showcases a mix of local boutiques and international brands.",
      "The city has a rich literary history and was named the UNESCO World Book Capital in 2011, celebrating its contribution to literature.",
    ],
    trivia: [
      "Buenos Aires has a wide variety of architectural styles, ranging from European-influenced designs to modern skyscrapers, reflecting its diverse cultural influences.",
      "The city's famed obelisk was erected in 1936 to commemorate the 400th anniversary of the founding of Buenos Aires.",
    ],
  },
  {
    city: "Toronto",
    country: "Canada",
    clues: [
      "This city is often referred to as the financial capital of Canada and is known for its diverse neighborhoods and vibrant arts scene.",
      "Home to a famous tower, this city hosts the largest street festival in the world, showcasing its rich multicultural heritage.",
    ],
    fun_fact: [
      "Toronto is one of the most multicultural cities in the world, with over 160 languages spoken throughout the city.",
      "The Toronto International Film Festival (TIFF) is one of the largest publicly attended film festivals in the world, attracting filmmakers and celebrities from around the globe.",
    ],
    trivia: [
      "The city was originally called York and was established in 1793 before being renamed Toronto in 1834.",
      "Toronto has more than 1,600 parks and an extensive network of ravines and waterfront, making it one of Canada's greenest cities.",
    ],
  },
  {
    city: "Omdurman",
    country: "Sudan",
    clues: [
      "This city lies on the west bank of the Nile River and is opposite the capital of Sudan.",
      "Known for its vibrant markets and rich historical significance, this city is the second most populous in its country.",
    ],
    fun_fact: [
      "Omdurman is home to the historic Omdurman Souq, one of the largest markets in Sudan.",
      "The city is famous for the Battle of Omdurman in 1898, which was a pivotal event in the Mahdist Revolt.",
    ],
    trivia: [
      "Omdurman houses the world's largest sufi gathering at the annual celebration of the birth of the Prophet Muhammad.",
      "The Al-Mahdi Mosque, located in Omdurman, honors the Mahdist leader Muhammad Ahmad and is a significant religious site.",
    ],
  },
  {
    city: "Dhaka",
    country: "Bangladesh",
    clues: [
      "This megacity, known for its remarkable population density, is situated in a region shaped by the Ganges Delta and features several rivers including the Buriganga.",
      "Home to over 10 million residents, this city is not only the capital of its country but also the largest Bengali-speaking city in the world.",
    ],
    fun_fact: [
      "The city has been a significant center of culture, economy, and science in Eastern South Asia.",
      "Dhaka is considered one of the most densely populated built-up urban areas globally, with a staggering density of over 23,000 people per square kilometer.",
    ],
    trivia: [
      "The city's historical names include 'Dacca', which was used during the British colonial period.",
      "Dhaka ranks third in South Asia and 39th worldwide in terms of Gross Domestic Product (GDP).",
    ],
  },
  {
    city: "Tianjin",
    country: "China",
    clues: [
      "This city is a direct-administered municipality in China, located on the shore of the Bohai Sea.",
      "It is part of a major economic region and is known for its unique blend of Eastern and Western architectural styles due to its history as a treaty port.",
    ],
    fun_fact: [
      "Tianjin is the largest coastal city in Northern China and serves as a major gateway to Beijing.",
      "The city's metropolitan area is home to over 11 million people, making it one of the largest urban agglomerations in the world.",
    ],
    trivia: [
      "Tianjin has a well-preserved area known as the 'Five Avenues,' featuring over 200 historical buildings from diverse architectural styles, including Gothic and Italian.",
      "The city is famous for its local snacks, particularly 'Tianjin Goubuli' steamed buns, which have a history dating back to the late 19th century.",
    ],
  },
  {
    city: "Boston",
    country: "United States",
    clues: [
      "This city played a pivotal role in the American Revolution, featuring events like the Boston Tea Party and Boston Massacre.",
      "It is known for its prestigious universities, including Harvard and MIT, and has a rich cultural scene characterized by historic sites and sports fandom.",
    ],
    fun_fact: [
      "Boston is home to the oldest municipal park in the United States, Boston Common, established in 1634.",
      "The city has a unique system of underground tunnels known as the 'Big Dig' that transformed its transportation infrastructure.",
    ],
    trivia: [
      "The iconic Boston Marathon is the oldest annual marathon in the world, first held in 1897.",
      "The city's nickname, 'Beantown,' is derived from its baked bean history, which was influenced by the early colonial settlers.",
    ],
  },
  {
    city: "Hanoi",
    country: "Vietnam",
    clues: [
      "This city, known as 'the place inside the river,' serves as the capital of its country and is famous for its centuries-old architecture and a rich cultural history influenced by both indigenous and colonial styles.",
      "Home to a historic citadel and one of the oldest universities in Southeast Asia, this destination is renowned for its unique cuisine, particularly its traditional coffee and street food.",
    ],
    fun_fact: [
      "The city was established as the capital of Vietnam in the 11th century, originally named Thăng Long, meaning 'ascending dragon.'",
      "Hanoi is home to over 1,000 years of history, making it one of the oldest capitals in the world, with a rich tapestry of stories from various dynasties.",
    ],
    trivia: [
      "Hanoi's population is approximately 8.6 million people, making it the second-most populous city in Vietnam.",
      "The city is divided into 12 urban districts and 17 rural districts, showcasing a mix of urban development and rural charm.",
    ],
  },
  {
    city: "Seattle",
    country: "United States",
    clues: [
      "This city is known for its iconic Space Needle and vibrant music scene, particularly grunge.",
      "Located between an inlet of the Pacific Ocean and a large lake, this city serves as a critical trade gateway to East Asia.",
    ],
    fun_fact: [
      "Seattle is home to the first Starbucks café, which opened in 1971 in Pike Place Market.",
      "The city experiences an average of 226 rainy days per year, giving it a reputation for its wet weather.",
    ],
    trivia: [
      "In 1962, Seattle hosted the World’s Fair, which showcased the Space Needle and received over 2.3 million visitors.",
      "Seattle has a significant history with aviation, being the birthplace of major companies such as Boeing.",
    ],
  },
  {
    city: "Monterrey",
    country: "Mexico",
    clues: [
      "This city is located at the foothills of a major mountain range and is known as a significant industrial hub in the northeast of Mexico.",
      "It is home to a suburb recognized for having the best quality of life in the country and has a population of over a million residents.",
    ],
    fun_fact: [
      "Monterrey serves as a vital commercial center for northern Mexico, housing numerous international corporations.",
      "The city's metropolitan area ranks as the second largest in Mexico, with a GDP that places it among the most productive in the country.",
    ],
    trivia: [
      "Monterrey was founded in 1596, making it one of the oldest cities in Mexico.",
      "The city is known for its unique cuisine, such as cabrito (roasted goat) and carnes asadas, which reflect its rich cultural heritage.",
    ],
  },
];

let i = 0;
cities.forEach(async (city) => {
  let shuffledCities = cities.sort(() => 0.5 - Math.random());
  let options = shuffledCities.slice(0, 8);
  options = options.map((e) => e.city);
  options.push(city.city);
  options = [...new Set(options)];
  let docId = `question-${i++}`;
  await setDoc(doc(db, "questions", docId), {
    clue: city.clues[Math.floor(Math.random() * city.clues.length)],
    options: options,
  });
  await addDoc(collection(db, "answers"), {
    answer: city.city,
    docId: docId,
  });

  await addDoc(collection(db, "trivia"), {
    funFact: city.fun_fact,
    trivia: city.trivia,
  });
});
