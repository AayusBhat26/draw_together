import { useEffect } from "react";

import { useRoom } from "@/common/recoil/room";

import { useMoveImage } from "./useMoveImage";
import { useRefs } from "./useRefs";

export const useImageClick = () => {
    const room = useRoom();
    const { canvasRef } = useRefs();
    const { setMoveImage } = useMoveImage();

    useEffect(() => {
        const handleCanvasClick = (e: MouseEvent) => {
            if (!canvasRef.current || !room) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Get all image moves
            const allMoves: Move[] = [];

            // Collect moves from all users - with null safety
            if (room.usersMoves) {
                room.usersMoves.forEach((moves) => allMoves.push(...moves));
            }
            if (room.movesWithoutUser) {
                allMoves.push(...room.movesWithoutUser);
            }
            if (room.myMoves) {
                allMoves.push(...room.myMoves);
            }

            // Find image moves in reverse order (top-most first)
            const imageMoves = allMoves
                .filter((move) => move?.options?.shape === "image")
                .reverse();

            // Check if click is within any image bounds
            for (const move of imageMoves) {
                if (!move.path || !move.path[0]) continue;

                const [x, y] = move.path[0];
                const width = move.img?.width || 0;
                const height = move.img?.height || 0;

                if (
                    width > 0 &&
                    height > 0 &&
                    clickX >= x &&
                    clickX <= x + width &&
                    clickY >= y &&
                    clickY <= y + height
                ) {
                    // Found a clicked image!
                    console.log(`[CLICK] Image clicked at (${x}, ${y}), size: ${width}x${height}`);

                    // Set the image to be moved
                    setMoveImage({
                        base64: move.img.base64,
                        x,
                        y,
                        moveId: move.id,
                    });

                    break;
                }
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener("click", handleCanvasClick);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener("click", handleCanvasClick);
            }
        };
    }, [canvasRef, room, setMoveImage]);
};
