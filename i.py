def tes():
  data = {
    'batch': '[{"method":"POST","body":"format=json&device_id=0cd272a7-17dc-4766-958e-5b48799250bf&email=dfhdrfghjfgj@gmail.com&password=badaklepas&credentials_type=password&generate_session_cookies=1&error_detail_type=button_with_disabled&machine_id=0cd272a7-17dc-4766-958e-5b48799250bf&locale=en_US&client_country_code=US&fb_api_req_friendly_name=authenticate","name":"authenticate","omit_response_on_success":false,"relative_url":"method/auth.login"},{"method":"POST","body":"query_id=10153437257771729&method=get&strip_nulls=true&query_params=%7B%220%22%3A75%2C%221%22%3A120%2C%222%22%3A480%7D&locale=en_US&client_country_code=US&fb_api_req_friendly_name=GetLoggedInUserQuery","name":"getLoggedInUser","depends_on":"authenticate","omit_response_on_success":false,"relative_url":"graphql?access_token={result=authenticate:$.access_token}"}]',
    'fb_api_caller_class': 'com.facebook.katana.server.handler.Fb4aAuthHandler',
    'fb_api_req_friendly_name': 'authLogin'
  }
  print(data)

if __name__ == "__main__":
    tes()
