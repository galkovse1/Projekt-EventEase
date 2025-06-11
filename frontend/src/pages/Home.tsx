import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import styles from './Home.module.css';

const events = [
  // Računalništvo (1–20)
  { id: 1, title: 'Noč hackanja s prijatelji', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
  { id: 2, title: 'Kreativni koderski maraton', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
  { id: 3, title: 'Startup vikend', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6' },
  { id: 4, title: 'AI izziv za mlade', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
  { id: 5, title: 'Frontend fiesta', image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0' }, // nova slika za Frontend fiesta
  { id: 6, title: 'Nočni debug party', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
  { id: 7, title: 'Kava & koda', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' }, // nova slika za Kava & koda
  { id: 8, title: 'Spletna delavnica React', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
  { id: 9, title: 'Python za začetnike', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
  { id: 10, title: 'UX/UI večer', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6' },
  { id: 11, title: 'Mobilne aplikacije 101', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
  { id: 12, title: 'Spletna varnost za študente', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
  { id: 13, title: 'Open source meetup', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6' },
  { id: 14, title: 'Digitalni nomadi', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
  { id: 15, title: 'Kreativno kodiranje', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6' }, // nova slika za Kreativno kodiranje
  { id: 16, title: 'Ekipa mladih razvijalcev', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41' },
  { id: 17, title: 'Večer z več zasloni', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
  { id: 18, title: 'Nočni projekt', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
  { id: 19, title: 'Spletni razvoj za vsakogar', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
  { id: 20, title: 'Hack & Chill', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6' },

  // Šport (21–40)
  { id: 21, title: 'Nogometni turnir za študente', image: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg' },
  { id: 22, title: 'Košarka pod reflektorji', image: 'https://images.pexels.com/photos/1103837/pexels-photo-1103837.jpeg' },
  { id: 23, title: 'Jutranji tek ob reki', image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg' },
  { id: 24, title: 'Kolesarski izziv', image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg' },
  { id: 25, title: 'Plavalni maraton', image: 'https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg' },
  { id: 26, title: 'Tenis za začetnike', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg' },
  { id: 27, title: 'Fitnes bootcamp', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' },
  { id: 28, title: 'Plezalni vikend', image: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg' },
  { id: 29, title: 'Smučarski dan', image: 'https://images.pexels.com/photos/848614/pexels-photo-848614.jpeg' },
  { id: 30, title: 'Joga v parku', image: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg' },
  { id: 31, title: 'Golf za mlade', image: 'https://images.pexels.com/photos/27406/pexels-photo-27406.jpg' },
  { id: 32, title: 'Odbojka na mivki', image: 'https://images.pexels.com/photos/2294401/pexels-photo-2294401.jpeg' },
  { id: 33, title: 'Namizni tenis challenge', image: 'https://images.pexels.com/photos/163209/sport-table-tennis-match-game-163209.jpeg' },
  { id: 34, title: 'Hokej na ledu', image: 'https://images.pexels.com/photos/163526/pexels-photo-163526.jpeg' },
  { id: 35, title: 'Rokometna avantura', image: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg' },
  { id: 36, title: 'Boksarski trening', image: 'https://images.pexels.com/photos/260447/pexels-photo-260447.jpeg' },
  { id: 37, title: 'Atletski miting', image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg' }, // nova, delujoča slika za Atletski miting
  { id: 38, title: 'Triatlon za mlade', image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg' },
  { id: 39, title: 'Kanu izziv', image: 'https://images.pexels.com/photos/208096/pexels-photo-208096.jpeg' },
  { id: 40, title: 'Surfanje na valovih', image: 'https://images.pexels.com/photos/416676/pexels-photo-416676.jpeg' },

  // Narava (41–60)
  { id: 41, title: 'Gozdni pobeg', image: 'https://images.pexels.com/photos/34950/pexels-photo.jpg' },
  { id: 42, title: 'Jezero v soncu', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
  { id: 43, title: 'Gorska dogodivščina', image: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg' },
  { id: 44, title: 'Rečni chill', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
  { id: 45, title: 'Morje in zabava', image: 'https://images.pexels.com/photos/417142/pexels-photo-417142.jpeg' },
  { id: 46, title: 'Poljski piknik', image: 'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg' },
  { id: 47, title: 'Travniki in druženje', image: 'https://images.pexels.com/photos/34950/pexels-photo.jpg' },
  { id: 48, title: 'Sončni zahod v naravi', image: 'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg' },
  { id: 49, title: 'Jutro v naravi', image: 'https://images.pexels.com/photos/417142/pexels-photo-417142.jpeg' },
  { id: 50, title: 'Zvezdnato doživetje', image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg' },
  { id: 51, title: 'Slap in raziskovanje', image: 'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg' },
  { id: 52, title: 'Pečina challenge', image: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg' },
  { id: 53, title: 'Naravni park', image: 'https://images.pexels.com/photos/34950/pexels-photo.jpg' },
  { id: 54, title: 'Pot v gozdu', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
  { id: 55, title: 'Jezero v gorah', image: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg' },
  { id: 56, title: 'Gorski potok', image: 'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg' },
  { id: 57, title: 'Drevesa in sprostitev', image: 'https://images.pexels.com/photos/34950/pexels-photo.jpg' },
  { id: 58, title: 'Naravni most', image: 'https://images.pexels.com/photos/417142/pexels-photo-417142.jpeg' },
  { id: 59, title: 'Planinski vrh', image: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg' },
  { id: 60, title: 'Mirna narava', image: 'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg' },
];

// Razdeli dogodke v 10 trakov brez ponavljanja (en dogodek na traku, če jih je več, se razporedijo po vrsti)
const NUM_TRACKS = 8;
// Enakomerno razporedi dogodke po trakovih (brez ponavljanja)
const splitEvents = Array.from({ length: NUM_TRACKS }, (_, t) =>
  events.filter((_, i) => i % NUM_TRACKS === t)
);

const Home = () => {
    const { isAuthenticated } = useAuth0();

    useEffect(() => {
        document.title = 'Domov | EventEase';
    }, []);

    return (
        <>
            <Helmet>
                <title>Domov | EventEase</title>
            </Helmet>
            <div className="relative w-full min-h-screen bg-[#f7f7fa] flex flex-col items-center justify-center px-4 py-12">
                {/* Animirane kartice v ozadju */}
                <div className={styles.backgroundTracks}>
  <div className={styles.tracksWrapper}>
    {splitEvents.map((trackEvents, i) => (
      <div
        key={i}
        className={styles.track}
        style={{
          animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          animationDuration: `60s`, // počasneje
        }}
      >
        {/* Za neprekinjenost: ponovi celoten niz dogodkov vsaj 2x */}
       // ...znotraj tvoje animirane .track...
{[...trackEvents, ...trackEvents, ...trackEvents].map((event, idx) => (
  <div key={event.id + '-' + idx} className={styles.cardBg}>
    <img
      src={event.image}
      alt={event.title}
      className={styles.cardBgImage}
    />
    <div className={styles.cardBgTitle}>{event.title}</div>
    <div style={{ width: '100%', textAlign: 'center', color: '#888', fontSize: '1rem', marginBottom: 8 }}>
      Dogodek potekel
    </div>
  </div>
))}
      </div>
    ))}
  </div>
</div>
                {/* Beli okvir */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xl w-full relative z-10" style={{ minHeight: 320 }}>
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                        Dobrodošli v EventEase
                    </h1>
                    <p className="text-2xl text-gray-600 mb-10 text-center">
                        Enostavno upravljanje z vašimi dogodki
                    </p>
                    <div className="space-x-4 flex flex-row justify-center w-full mb-10">
                        <Link
                            to="/events"
                            className="inline-block bg-[#363636] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow hover:bg-[#444] transition-colors"
                        >
                            Ogled dogodkov
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to="/events/create"
                                className="inline-block bg-[#363636] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow hover:bg-[#444] transition-colors"
                            >
                                Ustvari nov dogodek
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;