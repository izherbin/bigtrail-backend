interface Query {
  bucketName: string
  objectName: string
  'X-Amz-Algorithm': string
  'X-Amz-Credential': string
  'X-Amz-Date': string
  'X-Amz-Expires': string
  'X-Amz-Signature': string
  'X-Amz-SignedHeaders': string
}

export function parseLink(link: string): Query {
  try {
    const query = {} as Query
    query['bucketName'] = link.match(/\/{2}.*\/(.*)\//)[1]
    query['objectName'] = link.match(/\/([0-9a-zA-Z_.%-]*)\?/)[1]
    const queryArray = link.match(/\?(.*)$/)[1].split('&')
    for (const queryItem of queryArray) {
      const queryPair = queryItem.split('=')
      query[queryPair[0]] = queryPair[1]
    }
    return query
  } catch (err) {
    return null
  }
}

export function isExpired(link: string): boolean {
  const query = parseLink(link)
  if (!query) return false
  const created = query['X-Amz-Date']
  const expires = (Number(query['X-Amz-Expires']) - 12 * 3600) * 1000
  const date = new Date(
    Date.UTC(
      Number(created.substring(0, 4)),
      Number(created.substring(4, 6)) - 1,
      Number(created.substring(6, 8)),
      Number(created.substring(9, 11)),
      Number(created.substring(11, 13)),
      Number(created.substring(13, 15))
    )
  )

  return date.valueOf() + expires < Date.now()
}

// const link =
//   'https://minio.bigtrail.tech/avatars/1706693052847_659d65498140d5b3d72012d5.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20240131%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240208T090532Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=cd81fca7d31c54f7fac931d7a28c52fcb2e3ec1983d2ac2041694a186bbad327'
// const query = parseLink(link)
// console.log('query:', query)
// console.log('isExpired: ', isExpired(link))
// console.log('All done!!')
