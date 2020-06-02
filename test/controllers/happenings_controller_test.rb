# frozen_string_literal: true

require 'test_helper'

class HappeningsControllerTest < ActionDispatch::IntegrationTest
  test 'should get list' do
    get happenings_list_url
    assert_response :success
  end

  test 'should get register' do
    get happenings_register_url
    assert_response :success
  end
end
