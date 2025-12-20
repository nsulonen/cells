# GridLife

A web-based cellular automaton simulation inspired by Conway's Game of Life, using a Python/Flask backend and a JavaScript/HTML Canvas frontend.

## Simulation Model

The project implements a custom ecosystem simulation with four cell states:

*   **`ALIVE` / `REBORN`**: Living cells that age over time. `REBORN` cells are generated probabilistically from `DECAYING` matter and have unique survival traits.
*   **`DECAYING`**: The state left by cells that die of old age. This state enables the potential for rebirth in neighboring `EMPTY` cells.
*   **`EMPTY`**: Inactive space where new cells can be born.

The rules for state transition are designed to create a self-sustaining ecosystem that allows for emergent patterns to be observed.

## How to run

You will need [Python3](https://www.python.org/downloads) installed.

**1. Run the backend server**

Open a terminal and run these commands:

```sh
pip install -r backend/requirements.txt
python backend/main.py
```

**2. Open the frontend**

In your file explorer, navigate to the 'frontend' folder and open 'index.html' in your web browser.
