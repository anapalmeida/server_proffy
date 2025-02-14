import { Request, Response } from 'express'
import db from '../database/connection';
import converHourToMinute from '../utils/convertHourToMinutes';


interface scheduleItem {
  week_day: number,
  from: string,
  to: string
}

export default class ClassesController {

  //listagem 
  async index(req: Request, res: Response) {
    const filters = req.query

    if (!filters.week_day || !filters.subject || !filters.time) {
      return res.status(400).json({
        error: 'Missing filrers to searc classes'
      })
    }

    const subject = filters.subject as string
    const time = filters.time as string
    const week_day = filters.week_day as string


    const timeInMinutes = converHourToMinute(time)
 
    const classes = await db('classes')
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes` . `id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
      }
      )
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*'])

    return res.json(classes)
  
  }

  //criação
  async create(req: Request, res: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = req.body

    const trx = await db.transaction()
    try {

      const insertUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      })

      const user_id = insertUsersIds[0]

      const insertClassesId = await trx('classes').insert({
        subject,
        cost,
        user_id
      })

      const class_id = insertClassesId[0]

      const classSchedule = schedule.map((scheduleItem: scheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: converHourToMinute(scheduleItem.from),
          to: converHourToMinute(scheduleItem.to)
        }
      })

      await trx('class_schedule').insert(classSchedule)

      await trx.commit()

      return res.status(201).send()

    } catch (err) {

      await trx.rollback()

      return res.status(400).json(
        {
          error: 'Unexpected error while creating a new class'
        }
      )
    }

  }
}