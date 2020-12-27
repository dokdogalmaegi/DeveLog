// node에서 맞는 문법이 아니기 때문에 맨 앞에 ;이나 맨 뒤에 ;을 붙여주셔야합니다.

;(async () => {
    console.log(1)
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(2)
        resolve()
      }, 3000)
    })
    console.log(3)
})()

(async () => {
    console.log(1)
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(2)
        resolve()
      }, 3000)
    })
    console.log(3)
})();