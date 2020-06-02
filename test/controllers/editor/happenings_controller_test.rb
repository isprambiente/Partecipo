# frozen_string_literal: true

require 'test_helper'

class Editor::HappeningsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @editor_happening = editor_happenings(:one)
  end

  test 'should get index' do
    get editor_happenings_url
    assert_response :success
  end

  test 'should get new' do
    get new_editor_happening_url
    assert_response :success
  end

  test 'should create editor_happening' do
    assert_difference('Editor::Happening.count') do
      post editor_happenings_url, params: { editor_happening: { detail: @editor_happening.detail, max_seats: @editor_happening.max_seats, max_seats_for_ticket: @editor_happening.max_seats_for_ticket, start_at: @editor_happening.start_at, start_sale_at: @editor_happening.start_sale_at, stop_sale_at: @editor_happening.stop_sale_at } }
    end

    assert_redirected_to editor_happening_url(Editor::Happening.last)
  end

  test 'should show editor_happening' do
    get editor_happening_url(@editor_happening)
    assert_response :success
  end

  test 'should get edit' do
    get edit_editor_happening_url(@editor_happening)
    assert_response :success
  end

  test 'should update editor_happening' do
    patch editor_happening_url(@editor_happening), params: { editor_happening: { detail: @editor_happening.detail, max_seats: @editor_happening.max_seats, max_seats_for_ticket: @editor_happening.max_seats_for_ticket, start_at: @editor_happening.start_at, start_sale_at: @editor_happening.start_sale_at, stop_sale_at: @editor_happening.stop_sale_at } }
    assert_redirected_to editor_happening_url(@editor_happening)
  end

  test 'should destroy editor_happening' do
    assert_difference('Editor::Happening.count', -1) do
      delete editor_happening_url(@editor_happening)
    end

    assert_redirected_to editor_happenings_url
  end
end
