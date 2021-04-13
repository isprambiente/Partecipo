# frozen_string_literal: true

require 'test_helper'

class Editor::UsersControllerTest < ActionDispatch::IntegrationTest
  test 'should get index' do
    get editor_users_index_url
    assert_response :success
  end

  test 'should get list' do
    get editor_users_list_url
    assert_response :success
  end

  test 'should get show' do
    get editor_users_show_url
    assert_response :success
  end
end
