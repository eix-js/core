export type BitFieldEventCallback<T> = (data: T) => void

export interface BitFieldEventListener<T> {
    event: number
    callback: BitFieldEventCallback<T>
}

export class BitFieldEmitter<T> {
    private listeners: BitFieldEventListener<T>[] = []

    constructor(public bits = 16) {}

    public emit(event: number, data: T) {
        for (let position = 0; position < this.bits; position++) {
            if ((event >> position) & 1) {
                for (const listener of this.listeners) {
                    if ((listener.event >> position) & 1) {
                        listener.callback(data)
                    }
                }
            }
        }
    }

    public on(event: number, callback: BitFieldEventCallback<T>) {
        this.listeners.push({
            event,
            callback
        })
    }
}
