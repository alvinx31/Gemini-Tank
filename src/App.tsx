import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { Renderer } from './game/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new GameEngine();
    engineRef.current = engine;
    const renderer = new Renderer(ctx);

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling with arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      engine.handleKeyDown(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e.key);

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      engine.update(deltaTime);
      renderer.render(engine.state);

      if (engine.state.gameOver) {
        setGameState('GAMEOVER');
        setScore(engine.state.score);
      } else {
        setScore(engine.state.score);
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center font-sans text-white">
      <div className="mb-4 text-2xl font-bold tracking-widest text-yellow-400">
        TANK BATTALION
      </div>
      
      <div className="relative border-4 border-neutral-700 rounded-lg shadow-2xl bg-black overflow-hidden"
           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        
        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <h1 className="text-4xl font-black text-yellow-500 mb-8 tracking-widest">BATTLE CITY</h1>
            <p className="text-neutral-400 mb-8 text-sm">Use WASD or Arrows to move. Space to shoot.</p>
            <button 
              onClick={() => setGameState('PLAYING')}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <h2 className="text-5xl font-black text-red-500 mb-4 tracking-widest">GAME OVER</h2>
            <p className="text-2xl text-white mb-8">SCORE: {score}</p>
            <button 
              onClick={() => setGameState('PLAYING')}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
      </div>

      {gameState === 'PLAYING' && (
        <div className="mt-6 flex gap-8 text-neutral-400 font-mono text-lg">
          <div>SCORE: <span className="text-white font-bold">{score}</span></div>
        </div>
      )}
    </div>
  );
}
