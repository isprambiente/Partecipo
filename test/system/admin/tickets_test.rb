# frozen_string_literal: true

require 'application_system_test_case'

class Admin::TicketsTest < ApplicationSystemTestCase
  setup do
    @admin_ticket = admin_tickets(:one)
  end

  test 'visiting the index' do
    visit admin_tickets_url
    assert_selector 'h1', text: 'Admin/Tickets'
  end

  test 'creating a Ticket' do
    visit admin_tickets_url
    click_on 'New Admin/Ticket'

    fill_in 'Happenings', with: @admin_ticket.happenings_id
    fill_in 'Seats', with: @admin_ticket.seats
    fill_in 'User', with: @admin_ticket.user_id
    click_on 'Create Ticket'

    assert_text 'Ticket was successfully created'
    click_on 'Back'
  end

  test 'updating a Ticket' do
    visit admin_tickets_url
    click_on 'Edit', match: :first

    fill_in 'Happenings', with: @admin_ticket.happenings_id
    fill_in 'Seats', with: @admin_ticket.seats
    fill_in 'User', with: @admin_ticket.user_id
    click_on 'Update Ticket'

    assert_text 'Ticket was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Ticket' do
    visit admin_tickets_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Ticket was successfully destroyed'
  end
end
