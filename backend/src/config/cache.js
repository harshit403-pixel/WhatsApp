import Redis from 'ioredis'
import env from './env.js'


let redisClient  
export function getRedisClient(){
    if(!redisClient){
        redisClient = createRedisCLient() 
        
    }
    return redisClient
}

export function createRedisCLient(){
    redisClient = new Redis(env.REDIS_URL)

    redisClient.on("connect" , ()=>{
        console.log("Connected to redis")
        
    })
    redisClient.on("error", (err)=>{
        console.log("redis error", err)
        
    })

    return redisClient
}