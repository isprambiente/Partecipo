# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  test 'should get index' do
    get tickets_index_url
    assert_response :success
  end

  test 'should get show' do
    get tickets_show_url
    assert_response :success
  end

  test 'should get create' do
    get tickets_create_url
    assert_response :success
  end

  test 'should get destroy' do
    get tickets_destroy_url
    assert_response :success
  end
end
