import dayjs from "dayjs";

export function formatTime(time: string | number | Date | dayjs.Dayjs | null | undefined) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}