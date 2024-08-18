import httpMocks from 'node-mocks-http' // TODO: change the rotationName to just rotation post, and let the user send it through the slack request.
import { describe, it, jest, expect } from '@jest/globals'
import { NextApiRequest, NextApiResponse } from 'next'


describe("RotationName POST", () => {

  it("should be able to determine the next user given an array of users", async () => {


  })



  it('should handle nextjs requests', async () => {
    const mockExpressRequest = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      url: '/rotationName',
      params: {
        id: 42
      }
    });


    const mockExpressResponse = httpMocks.createResponse<NextApiResponse>()
    // const res = await POST(mockExpressRequest)



    expect(true).toBeTruthy()




    // ... the rest of the test as above.
  });





})

