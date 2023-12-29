import { useRef, useEffect, useState } from "react";

type Interval = ReturnType<typeof setInterval>;

export default function Game() {
  const [gameState, setGameState] = useState<"play" | "pause" | "stop">("stop");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsCurrentGeneration = useRef<Array<Array<boolean>>>([]);
  const interval = useRef<Interval>();

  function fillArray(array: Array<Array<boolean>>) {
    for (let i = 0; i < 64; i++) {
      array[i] = [];
      for (let j = 0; j < 64; j++) {
        array[i][j] = false;
      }
    }
  }

  function makeInitialCellsState() {
    fillArray(cellsCurrentGeneration.current);
  }

  function getCellPosition(
    i: number,
    j: number,
    iOffset: number,
    jOffset: number
  ) {
    return [
      (cellsCurrentGeneration.current.length + (i + iOffset)) %
        cellsCurrentGeneration.current.length,
      (cellsCurrentGeneration.current.length + (j + jOffset)) %
        cellsCurrentGeneration.current.length,
    ];
  }

  function checkCell(i: number, j: number) {
    let aliveCount = 0;
    for (let iOffset = -1; iOffset < 2; iOffset++)
      for (let jOffset = -1; jOffset < 2; jOffset++) {
        const [x, y] = getCellPosition(i, j, iOffset, jOffset);
        if (i === x && j === y) continue;
        if (cellsCurrentGeneration.current[x][y]) aliveCount++;
        if (aliveCount > 3) break;
      }
    if (cellsCurrentGeneration.current[i][j])
      return aliveCount === 2 || aliveCount === 3;
    return aliveCount === 3;
  }

  function makeLifeIteration() {
    const cellsNextGeneration: Array<Array<boolean>> = [];
    fillArray(cellsNextGeneration);
    for (let i = 0; i < cellsCurrentGeneration.current.length; i++) {
      for (let j = 0; j < cellsCurrentGeneration.current.length; j++) {
        cellsNextGeneration[i][j] = checkCell(i, j);
      }
    }
    cellsCurrentGeneration.current = cellsNextGeneration;
  }

  function draw() {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.lineWidth = 0.4;

    for (let i = 0; i < cellsCurrentGeneration.current.length; i++)
      for (let j = 0; j < cellsCurrentGeneration.current.length; j++) {
        ctx.strokeRect(i * 14, j * 14, 14, 14);
        if (cellsCurrentGeneration.current[i][j]) {
          ctx.fillRect(j * 14 + 1, i * 14 + 1, 12, 12);
        }
      }
  }

  function handleCanvasClick(
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) {
    if (!canvasRef.current) return;
    if (gameState === "play") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const [j, i] = getIndexesByCoords(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    console.log(i, j);
    cellsCurrentGeneration.current[i][j] =
      !cellsCurrentGeneration.current[i][j];
    draw();
  }

  function getIndexesByCoords(x: number, y: number) {
    return [Math.floor(x / 14), Math.floor(y / 14)];
  }

  useEffect(() => {
    makeInitialCellsState();
    draw();
  }, []);

  useEffect(() => {
    if (gameState === "play")
      interval.current = setInterval(() => {
        makeLifeIteration();
        draw();
      }, 100);

    if (gameState === "stop") {
      makeInitialCellsState();
      draw();
    }

    if (gameState === "pause" || gameState === "stop") {
      clearInterval(interval.current);
    }

    return () => {
      if (!interval.current) return;
      clearInterval(interval.current);
    };
  }, [gameState]);

  return (
    <div>
      <button onClick={() => setGameState("play")}>Старт</button>
      <button onClick={() => setGameState("stop")}>Стоп</button>
      <button onClick={() => setGameState("pause")}>Пауза</button>
      <br />
      <canvas
        ref={canvasRef}
        width={896}
        height={896}
        onClick={handleCanvasClick}
      />
    </div>
  );
}
