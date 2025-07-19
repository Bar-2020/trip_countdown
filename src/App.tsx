import './App.css'
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import Confetti from 'react-confetti'
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import {useState} from "react";
import {useWindowSize} from "react-use";
import { fromZonedTime } from 'date-fns-tz'

const takeoffDate = fromZonedTime('2025-09-06 05:00:00', 'Asia/Jerusalem')


function App() {
    const [isExploding, setIsExploding] = useState(false)
    const { width, height } = useWindowSize()

    const startExploding = () => {setIsExploding(true)}

    return (
        <div
            style={{
                backgroundImage: 'url(/paros.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.8,
                height: '100vh',
                width: '100vw',display: 'flex',flexDirection:'column', justifyContent: 'center',alignItems: 'center',
            }}
        >
    <div style={{
        borderRadius: '0.5rem',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
    }>
            <h1 style={{color:'black'}}>Ella and Bar's Greece Countdown!! ❤️ </h1>
            <FlipClockCountdown to={takeoffDate} onComplete={startExploding} hideOnComplete={false}/>

        </div>{isExploding &&<Confetti
            width={width}
            height={height}
        />}</div>
    )
}

export default App