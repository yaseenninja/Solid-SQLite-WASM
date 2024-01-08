import sqlite3InitModule, { OpfsDatabase } from '@sqlite.org/sqlite-wasm';

let db: OpfsDatabase;
const createDb = async (messageId: number) => {
    console.log("Creating db from worker")
    sqlite3InitModule().then((sqlite3) => {
        try {
            db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3', "c");
            console.log('Created persisted database at', db.filename);
            db.exec("CREATE TABLE IF NOT EXISTS users(uid INTEGER PRIMARY KEY, name VARCHAR(30), gender CHAR(6), email VARCHAR(30), city VARCHAR(30))");
            console.log('Created table successfully...');
            db.exec(`
                PRAGMA page_size=8192;
                PRAGMA journal_mode=MEMORY;
            `);
            console.log('Done initializing. Running demo...');
            const messageValue = messageQueue.get(messageId)
            messageQueue.set(messageId, {
                status: "success",
                data: messageValue.data
            })
            list()
        } catch (err) {
            console.error(err);
            messageQueue.set(messageId, {
                status: "failed"
            })
        }
    });
}

const add = async (messageId: number, value: messageValues) => {
    db.exec({
        sql: 'INSERT INTO users VALUES (?,?,?,?,?)',
        bind: [value.uid ?? '', value.name ?? '', value.gender ?? '', value.email ?? '', value.city ?? ''],
    });
    let messageValue = messageQueue.get(messageId)
    messageQueue.set(messageId, {
        status: "success",
        data: messageValue.data
    })
};
const update = (messageId: number, value: messageValues) => {
    db.exec({
        sql: `UPDATE users SET name=(?), gender=(?), email=(?), city=(?) WHERE uid=(?)`,
        bind: [value.name ?? '', value.gender ?? '', value.email ?? '', value.city ?? '', value.uid ?? ''],
    });
    let messageValue = messageQueue.get(messageId)
    messageQueue.set(messageId, {
        status: "success",
        data: messageValue.data
    })
};
const deleteValue = (messageId: number, value: messageValues) => {
    db.exec({
        sql: `Delete FROM users where uid=${value.uid ?? ''}`
    });
    let messageValue = messageQueue.get(messageId)
    messageQueue.set(messageId, {
        status: "success",
        data: messageValue.data
    })
    list()
};

const list = () => {
    const start = performance.now()
    const res = db.exec({
        sql: 'SELECT * FROM users',
        rowMode: 'object'
    })
    const endTime = performance.now() - start
    console.log(`Done in ${endTime} ms`)
    postMessage({
        type: "list",
        data: res
    })
};

interface messageValues {
    type: string,
    uid?: number,
    name?: string,
    gender?: string,
    email?: string,
    city?: string
}

const messageQueue = new Map()
let messageIdCounter = 0

const syncRemote = async (_data: messageValues) => {
    // TODO: Sync data to remote
    // await fetch('http://127.0.0.1:8000/api/users', {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data)
    // })
}

onmessage = async ({ data }: MessageEvent<messageValues>) => {
    messageQueue.set(messageIdCounter, {
        status: "running",
        data
    })
    switch (data.type) {
        case "create":
            await createDb(messageIdCounter)
            break
        case "add":
            await add(messageIdCounter, data)
            syncRemote(data)
            break
        case "update":
            update(messageIdCounter, data)
            syncRemote(data)
            break
        case "delete":
            deleteValue(messageIdCounter, data)
            syncRemote(data)
            break
        case "list":
            list()
            break
    }
    messageIdCounter++
}