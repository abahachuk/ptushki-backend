# Наблюдение

Этот документ будет содержать структурное и функциональное описание данной сущности.

## Структура

| Поле                  | Тип                     | Значение                                                                  | Дефолт  | Req. |  EURING   | Eng | Rus | Bel |
| --------------------- | ----------------------- | ------------------------------------------------------------------------- | :-----: | :--: | :-------: | --- | --- | --- |
| id                    | `string`                | UUID                                                                      |    -    |  -   |           |     |     |     |
| ring                  | `Ring`                  | ссылка на кольцо                                                          |         |      |           |     |     |     |
| ringMentioned         | `string`                | кольцо по наблюдателю                                                     |         |      |           |     |     |     |
| finder                | `User`                  | ссылка на пользователя                                                    |         |      |           |     |     |     |
| photos                | `string[]`, `null`      | фото                                                                      |         |      |           |     |     |     |
| speciesMentioned      | `Species`               | вид птицы по наблюдателю                                                  |         |  да  |    да     |     |     |     |
| speciesConcluded      | `Species`               | подтвержденный вид птицы                                                  |         |      |    да     |     |     |     |
| sexMentioned          | `Sex`                   | пол птицы по наблюдателю                                                  |         |  да  |    да     |     |     |     |
| sexConcluded          | `Sex`                   | подтвержденный пол птицы                                                  |         |      |    да     |     |     |     |
| ageMentioned          | `Age`                   | возраст птицы по наблюдателю                                              |         |  да  |    да     |     |     |     |
| ageConcluded          | `Age`                   | подтвержденный возраст птицы                                              |         |      |    да     |     |     |     |
| distance              | `number`, `null`        | расстояние от места кольцевания, в км.                                    |         |      |    да     |     |     |     |
| direction             | `number`, `null`        | направление от места кольцевания, в град.                                 |         |      |    да     |     |     |     |
| elapsedTime           | `number`, `null`        | время прошедшее с момента кольцевания в днях                              |         |      |    да     |     |     |     |
| colorRing             | `string`, `null`        | это поле используется в Access для остальных меток                        |         |      |           |     |     |     |
| manipulated           | `Manipulated`           | действия совершавшиеся при наблюдении                                     |         |      |    да     |     |     |     |
| movedBeforeTheCapture | `MovedBeforeTheCapture` | перемещалась ли птица до наблюдения                                       |         |      |    да     |     |     |     |
| catchingMethod        | `CatchingMethod`        | Метод отлова                                                              |         |      |    да     |     |     |     |
| catchingLures         | `CatchingLures`         | Приспособления для поимки                                                 |         |      |    да     |     |     |     |
| date                  | `Date`, `null`          | Дата наблюдения                                                           |         |      |    да     |     |     |     |
| accuracyOfDate        | `AccuracyOfDate`        | Точность этой даты                                                        |         |      |    да     |     |     |     |
| latitude              | `number`, `null`        | Широта                                                                    |         |      | не совсем |     |     |     |
| longitude             | `number`, `null`        | Долгота                                                                   |         |      | не совсем |     |     |     |
| accuracyOfCoordinates | `AccuracyOfCoordinates` | Точность этих координат                                                   |         |      |    да     |     |     |     |
| status                | `Status`                | Статус взрослой птицы: гнездится, болеет, линяет...<br />Для птенцов `--` |         |      |    да     |     |     |     |
| pullusAge             | `PullusAge`             | возраст птенца, измеряется в днях, для взрослой `--`                      |         |      |    да     |     |     |     |
| accuracyOfPullusAge   | `AccuracyOfPullusAge`   | точность этого возраста. Если птица взрослая, то `-`                      |         |      |    да     |     |     |     |
| condition             | `Condition`             | Состояние птицы когда произошло наблюдение (поимка)                       |         |      |    да     |     |     |     |
| circumstances         | `Circumstances`         | Обстоятельства, при которых была найдена птица                            |         |      |    да     |     |     |     |
| circumstancesPresumed | `CircumstancesPresumed` | Достоверность обстоятельств                                               |         |      |    да     |     |     |     |
| placeName             | `string`, `null`        | Место наблюдения                                                          |         |      |    да     |     |     |     |
| placeCode             | `PlaceCode`             | Место наблюдения по коду. Например, `BY25`.                               |         |  да  |    да     |     |     |     |
| remarks               | `string`, `null`        | Пометки                                                                   |         |      |    да     |     |     |     |
| verified              | `boolean`               | Статус данного наблюдения для его процессинга                             | `false` |      |           |     |     |     |
