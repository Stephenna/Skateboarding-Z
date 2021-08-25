const MOVE_SPEED = 200
const JUMP_FORCE = 450
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 400
const ENEMY_SPEED = 20

kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  
})


loadSprite('bg', './img/bg900px.png');
loadSprite('floor', './img/bricked.png');
loadSprite('brick', './img/brick2.png');
loadSprite('block', './img/block.png');
loadSprite('car1', './img/car-1.png');
loadSprite('car2', './img/car-2.png');
loadSprite('clouds', './img/clouds.png');
loadSprite('cracked', './img/cracked-bricked.png');
loadSprite('helmet', './img/helmet.png');
loadSprite('grindBar', './img/small-tbar.png');
loadSprite('joe', './img/joe.png');
loadSprite('joe100', './img/joe100px.png');
loadSprite('joe50', './img/joe50px.png');
loadSprite('mini', './img/mini.png');
loadSprite('pencil', './img/pencil.png');
loadSprite('vans', './img/van3.png');
loadSprite('van', './img/van.png');
loadSprite('z', './img/z.png');




scene('game', ({level, score}) =>{
 
  layers([ 'bg', 'obj', 'ui',], 'obj');
   addSprite("bg", {
    width: width(),
    height: height(),
    layer: 'bg'
  });
  camIgnore(['bg', 'ui']);
  
  const maps = [
    [
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '        !                V       ',
      '      _   _  VVVV        V       ',
      '              VVVV      M       ',
      '_______________________     _____',
    ], 
    [
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '                                ',
      '        !     V V        V       ',
      '               V V   5    M       ',
      '_______________________          ',
    ], 
    [
      '                                  ',
      '                                  ',
      '                        M         ',
      '              VVVV 5              ',
      '             ________             ',
      '         VV                        ',
      '      ! ____                       ',
      '                                   ',
      '________                           ',
    ], 
    [
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '     VVVVVVVVVVVVVVVVVVVVV       ',
      ' _______________________         ',
      '                      *          ',
      '                              M   ' ,
    ], 
    [
      '       VV                            ',
      '____       V                   ',
      '    *        V                   ',
      '              V V V ! 5!         ',
      '                 ______           ',
      '                                  ',
      '                           M ',
      '                                   ',
      '                          ',
    ],
 
  ]
  console.log(maps.length)
  const levelConfg = {
    width: 30,
    height: 50,
    '5' : [sprite('joe50'), solid(), scale(2), 'dangerous'],
    'V' : [sprite('vans'), 'vans-shoe'],
    '!' : [sprite('helmet'), 'vans-surp', scale(1.2), solid()],
    '|' : [sprite('helmet'), 't-bar-surp', scale(1.2)],
    'X' : [sprite('helmet'), scale(1.1)],
    '_' : [sprite('floor'), solid(), scale(1.7), 'floor'],
    '=' : [sprite('block'), solid()],
    '-' : [sprite('brick'), solid()],
    '(' : [sprite('car1')],
    ')' : [sprite('car2'), solid()],
    'M' : [sprite('mini'), scale(2.2), solid(), 'mini'],
    'T' : [sprite('grindBar'), solid(), scale(3.5)],
    '*' : [sprite('grindBar'), solid(), scale(3.5), 'floatBar'],
    '1' : [sprite('joe100'), solid(), 'dangerous', scale(1)],
    '%' : [sprite('cracked'), solid()],
    'P' : [sprite('pencil'), solid()],
    '2' : [sprite('van'), solid()],

  }
  const gameLevel = addLevel(maps[level], levelConfg);

  const player = add([
    sprite('z'),
    solid(),
    pos(30, 0),
    body(),
    scale(2),
  ])
  const scoreLabel = add([
    text([`SCORE: ${score} `]),
    pos(100, 35),
    layer('ui'),
    {
      value: score
    },
  ])

  add([text('level ' + parseInt(level + 1)), pos(400, 465), scale(2)])

  player.action(() => {
    camPos(player.pos);
   
    if(player.pos >= FALL_DEATH){
      go('lose', {score: scoreLabel.value})
    } 
  });


  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })
  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('space', () => {
    if(player.grounded()){
      player.jump(JUMP_FORCE)
    }
  })

  keyPress(('z'), () => {
    go('game', {
        level: (level + 1)
    })
})
 
  action('floatBar', f => {
    f.move(ENEMY_SPEED, 0)
  })
  
  action('dangerous', d => {
    d.move(-ENEMY_SPEED, 0)
  })

  player.collides('mini', (m) => {
    camPos(player.pos);
    camScale(2)
    keyPress('down', () => {

      if(maps.length > level){
        go('game', {
          level: (level + 1),
          score: scoreLabel.value
        })
      } else {
        // go('win', {score: `${scoreLabel.value}`})
        go('game', {
          // level: (level + 1),
          // score: scoreLabel.value
        })
      }
      
    })
  
  })

  // VANS POINTS
  player.on('headbutt', (obj) => {
    if(obj.is('vans-surp')){
      gameLevel.spawn('V', obj.gridPos.sub(0, 1))
      player.grounded()
      gameLevel.spawn('_', obj.gridPos.sub(0,0))
      obj.destroy()
    }
  })

  player.collides('vans-shoe', (VS) => {
    scoreLabel.value ++
    scoreLabel.text = scoreLabel.value
    destroy(VS)
  })

  // DANGEROUS
  player.collides('dangerous', (d) =>{
    if(player.jump()){
        destroy(d)
    } else {
    go('lose', { 
      score: `Score: ${scoreLabel.value} U LOSE`})
    }
  })

  // DYING
  player.action(() => {
    // center camera to player
    camPos(player.pos);
    // check fall death
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: `Score:${scoreLabel.value} U LOSE`})
    }
  });

});

scene('lose', ({ score }) => {
  layers([ 'bg', 'obj', 'ui',], 'obj'); 
  add([
    text(score, 32),
    pos(width()/2, height()/2),
    origin('center'),
    color(255, 0, 0),
  ])

  
  addSprite("bg", {
    width: width(),
    height: height(),
    layer: 'bg'
  });
  camShake(12);
})

scene('win' ,({score}) => {
  layers([ 'bg', 'obj', 'ui',], 'obj'); 
   add([
      text(score, 32),
      pos(width()/2, height()/2),
      origin('center'),
      color(255, 0, 0),
    ])

    
    addSprite("bg", {
     width: width(),
     height: height(),
     layer: 'bg'
   });
})

go('game', {level: 0, score: 0})
