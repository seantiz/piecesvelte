import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'calories-chambers-punctures'),
    { disableLosslessIntegers : true }
)

try {
await driver.getServerInfo()
} catch (e) {
    console.error('Could not retrieve server info from neo4j.')
}

const session = driver.session()
const res = await session.run(
    `
      MATCH (p:Person)-[:DIRECTED]->(:Movie {title: $title})
      RETURN p.name
    `, 
    { title: 'The Matrix' },
    { timeout: 3000 } 
  )

const people = res.records.map(
    (record: Record) => record.get('p')
  )

await driver.close()