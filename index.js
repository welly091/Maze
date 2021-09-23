const{ Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cells=10;
const width = 800;
const height = 800;

const unitLength = width / cells; 

const engine = Engine.create();
engine.world.gravity.y=0;
const{ world } = engine;

const render = Render.create({
    element: document.body,
    engine: engine,
    options:{
        wireframes: true,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


//Position and size.
//x, y, wide, tall 
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, {isStatic: true}),
];

World.add(world, walls);

//Maze generation

const shuffle = (arr) =>{
    let counter = arr.length;

    while(counter>0){
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));
    //.map() will access to each element and create new elements(here is 'arrays')

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells-1).fill(false));

const horizontals = Array(cells-1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) =>{
    //If cells are visited at [row, colum], return
    if(grid[row][column]){
        return;
    }

    //Mark the cell as being visited
    grid[row][column] = true;

    //Aseemble randomly-ordered list of 'neighbors'
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1,column, 'down'],
        [row, column - 1, 'left'],
    ]);
    
    //For each neighbor...
    for(let neighbor of neighbors){
        const [nextRow, nextColumn, direction] = neighbor;
    
    //See if that neighbor is out of bounds
        if(nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells){
            continue;
        }
    //If we have visited that neighbor continue to next neighbor
        if(grid[nextRow][nextColumn]){
            continue;
        }
    //Remove a wall from either horizontals or verticals
    if(direction === 'left'){
        verticals[row][column-1] = true;
    }else if(direction === 'right'){
        verticals[row][column]= true;
    }else if(direction === 'down'){
        horizontals[row][column] = true;
    }else if(direction === 'up'){
        horizontals[row-1][column]=true;
    }
    //Visited that next cell 
    stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex )=> {
    row.forEach((open, columnIndex) =>{
        if(open === true){
            return;
        }
        //If the element is 'False'
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            10,
            {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) =>{
    row.forEach((open, columnIndex) =>{
        if(open){
            return;
        }
        //If the element is 'False'
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            10,
            unitLength,
            
            {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

//This is the goal rectangle
const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * .7,
    unitLength * .7,
    {
        label: 'goal',
        isStatic: true
    }
)
World.add(world, goal);

//Ball
const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength / 4,
    {label:'ball'}
);
World.add(world, ball);

document.addEventListener('keydown', event =>{
    const{x,y} = ball.velocity;
    //Up
    if(event.key==='w'){
        Body.setVelocity(ball, {x, y: y-5})
    }
    //Down
    if(event.key === 's'){
        Body.setVelocity(ball, {x, y: y+5})
    }
    //Left, 'A'
    if(event.key === 'a'){
        Body.setVelocity(ball, {x: x-5, y})
    }
    //Right, 'D'
    if(event.key === 'd'){
        Body.setVelocity(ball, {x: x+5, y})
    }
});

//Win Condition
Events.on(engine,'collisionStart', event =>{
    event.pairs.forEach(collision =>{
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y=1;
            world.bodies.forEach(body=>{
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
        }
    });
});