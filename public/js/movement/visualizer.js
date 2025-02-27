class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;
        for (let l = network.levels.length - 1; l >= 0; l--) {
            const levelTop = top + lerp(
                height - levelHeight,
                0,
                network.levels.length == 1
                    ? 0.5
                    : l / (network.levels.length - 1)
            );

            ctx.setLineDash([7,3]);
            Visualizer.drawLevel(ctx, network.levels[l],
                left, levelTop,
                width, levelHeight,
                l == network.levels.length - 1
                    ? ['↑', '←', '→', '↓']
                    : []
            );

        }
    }

    static drawLevel(ctx, level, left, top, width, height, outputLabels) {
        const right = left + width;
        const bottom = top + height;

        const biasRadius = 18;
        const nodeRadius = biasRadius * 0.6;

        const { inputs, outputs, weights, biases } = level;

        for (let i = 0; i < inputs.length; i++) {
            for (let o = 0; o < outputs.length; o++) {
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs, i, left, right),
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs, o, left, right),
                    top
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(weights[i][o])
                ctx.stroke();
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right);

            ctx.beginPath();
            ctx.arc(x, bottom, biasRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        for (let o = 0; o < outputs.length; o++) {
            const x = Visualizer.#getNodeX(outputs, o, left, right);

            ctx.beginPath();
            ctx.arc(x, top, biasRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, top, biasRadius, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(outputs[o]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, biasRadius, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases[o]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[o]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.font = (biasRadius * 1.5) + "px Arial";
                ctx.fillText(outputLabels[o], x, top);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[o], x, top);
            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(
            left,
            right,
            nodes.length == 1
                ? 0.5
                : index / (nodes.length - 1)
        );
    }
}