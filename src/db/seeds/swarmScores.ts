import { db } from '@/db';
import { swarmScores } from '@/db/schema';

async function main() {
    const agentTypes = ['urgency', 'impact', 'sentiment', 'novelty', 'effort'];
    
    const sampleSwarmScores = [
        // Critical Security Bug (ID: 1)
        { feedbackId: 1, agentType: 'urgency', score: 95, reasoning: 'Critical security vulnerability affecting user data integrity requires immediate attention.', createdAt: new Date('2024-01-15T10:30:00').toISOString() },
        { feedbackId: 1, agentType: 'impact', score: 88, reasoning: 'Security issue potentially affects all users across the platform with data breach risk.', createdAt: new Date('2024-01-15T10:32:00').toISOString() },
        { feedbackId: 1, agentType: 'sentiment', score: 92, reasoning: 'Customer expressed severe concern and frustration about potential data compromise.', createdAt: new Date('2024-01-15T10:35:00').toISOString() },
        { feedbackId: 1, agentType: 'effort', score: 75, reasoning: 'Security patch requires thorough testing and coordination across multiple systems.', createdAt: new Date('2024-01-15T10:40:00').toISOString() },

        // Feature Request - Dark Mode (ID: 2)
        { feedbackId: 2, agentType: 'urgency', score: 35, reasoning: 'Feature enhancement that would improve user experience but not blocking current functionality.', createdAt: new Date('2024-01-18T14:20:00').toISOString() },
        { feedbackId: 2, agentType: 'impact', score: 65, reasoning: 'Dark mode is frequently requested by many users and would improve accessibility.', createdAt: new Date('2024-01-18T14:25:00').toISOString() },
        { feedbackId: 2, agentType: 'novelty', score: 25, reasoning: 'Dark mode is a common feature request across most applications, not particularly novel.', createdAt: new Date('2024-01-18T14:30:00').toISOString() },
        { feedbackId: 2, agentType: 'effort', score: 45, reasoning: 'Requires CSS theme system implementation but framework supports this relatively well.', createdAt: new Date('2024-01-18T14:35:00').toISOString() },

        // Performance Issue (ID: 3)
        { feedbackId: 3, agentType: 'urgency', score: 78, reasoning: 'Performance degradation significantly impacts user productivity and needs prompt resolution.', createdAt: new Date('2024-01-22T09:15:00').toISOString() },
        { feedbackId: 3, agentType: 'impact', score: 82, reasoning: 'Slow loading times affect majority of users during peak hours, business critical.', createdAt: new Date('2024-01-22T09:20:00').toISOString() },
        { feedbackId: 3, agentType: 'sentiment', score: 85, reasoning: 'Multiple frustrated users reporting productivity loss due to system slowness.', createdAt: new Date('2024-01-22T09:25:00').toISOString() },
        { feedbackId: 3, agentType: 'effort', score: 60, reasoning: 'Performance optimization may require database indexing and caching improvements.', createdAt: new Date('2024-01-22T09:30:00').toISOString() },

        // UI Bug (ID: 4)
        { feedbackId: 4, agentType: 'urgency', score: 45, reasoning: 'UI alignment issue affects visual presentation but does not block core functionality.', createdAt: new Date('2024-01-25T11:45:00').toISOString() },
        { feedbackId: 4, agentType: 'impact', score: 30, reasoning: 'Visual bug affects specific component used by subset of users in certain workflows.', createdAt: new Date('2024-01-25T11:50:00').toISOString() },
        { feedbackId: 4, agentType: 'effort', score: 15, reasoning: 'Simple CSS fix that can be resolved quickly with minimal testing required.', createdAt: new Date('2024-01-25T11:55:00').toISOString() },

        // Mobile App Crash (ID: 5)
        { feedbackId: 5, agentType: 'urgency', score: 90, reasoning: 'App crashes prevent users from accessing core functionality on mobile devices.', createdAt: new Date('2024-01-28T16:10:00').toISOString() },
        { feedbackId: 5, agentType: 'impact', score: 75, reasoning: 'Crash affects mobile users but desktop functionality remains unimpacted.', createdAt: new Date('2024-01-28T16:15:00').toISOString() },
        { feedbackId: 5, agentType: 'sentiment', score: 88, reasoning: 'Users expressing anger and frustration about inability to use mobile app.', createdAt: new Date('2024-01-28T16:20:00').toISOString() },
        { feedbackId: 5, agentType: 'novelty', score: 20, reasoning: 'Mobile crashes are common issues that require standard debugging approaches.', createdAt: new Date('2024-01-28T16:25:00').toISOString() },

        // API Documentation Request (ID: 6)
        { feedbackId: 6, agentType: 'urgency', score: 25, reasoning: 'Documentation improvement would help developers but not blocking current development.', createdAt: new Date('2024-02-01T13:30:00').toISOString() },
        { feedbackId: 6, agentType: 'impact', score: 40, reasoning: 'Better documentation would assist developer onboarding but affects limited user base.', createdAt: new Date('2024-02-01T13:35:00').toISOString() },
        { feedbackId: 6, agentType: 'effort', score: 30, reasoning: 'Documentation updates require time investment but no complex technical implementation.', createdAt: new Date('2024-02-01T13:40:00').toISOString() },

        // Data Export Feature (ID: 7)
        { feedbackId: 7, agentType: 'urgency', score: 50, reasoning: 'Data export capability requested by enterprise customers for compliance requirements.', createdAt: new Date('2024-02-05T10:20:00').toISOString() },
        { feedbackId: 7, agentType: 'impact', score: 70, reasoning: 'Export functionality critical for enterprise adoption and regulatory compliance.', createdAt: new Date('2024-02-05T10:25:00').toISOString() },
        { feedbackId: 7, agentType: 'novelty', score: 35, reasoning: 'Data export is standard enterprise feature, implementation approach is well-established.', createdAt: new Date('2024-02-05T10:30:00').toISOString() },
        { feedbackId: 7, agentType: 'effort', score: 55, reasoning: 'Export feature requires backend processing and multiple format support implementation.', createdAt: new Date('2024-02-05T10:35:00').toISOString() },

        // Login Issues (ID: 8)
        { feedbackId: 8, agentType: 'urgency', score: 85, reasoning: 'Authentication failures prevent users from accessing the application entirely.', createdAt: new Date('2024-02-08T08:45:00').toISOString() },
        { feedbackId: 8, agentType: 'impact', score: 90, reasoning: 'Login issues affect all users attempting to access the platform, critical business impact.', createdAt: new Date('2024-02-08T08:50:00').toISOString() },
        { feedbackId: 8, agentType: 'sentiment', score: 95, reasoning: 'Users extremely frustrated as they cannot access their accounts or complete work.', createdAt: new Date('2024-02-08T08:55:00').toISOString() },
        { feedbackId: 8, agentType: 'effort', score: 40, reasoning: 'Authentication issue may require configuration fix or third-party service investigation.', createdAt: new Date('2024-02-08T09:00:00').toISOString() },

        // Notification Preferences (ID: 9)
        { feedbackId: 9, agentType: 'urgency', score: 30, reasoning: 'Notification customization would improve user experience but not urgent priority.', createdAt: new Date('2024-02-12T15:15:00').toISOString() },
        { feedbackId: 9, agentType: 'impact', score: 45, reasoning: 'Notification controls requested by moderate number of users for personalization.', createdAt: new Date('2024-02-12T15:20:00').toISOString() },
        { feedbackId: 9, agentType: 'sentiment', score: 40, reasoning: 'Users expressing mild frustration with current notification frequency and types.', createdAt: new Date('2024-02-12T15:25:00').toISOString() },

        // Advanced Search Feature (ID: 10)
        { feedbackId: 10, agentType: 'urgency', score: 40, reasoning: 'Enhanced search would improve productivity but current search meets basic needs.', createdAt: new Date('2024-02-15T12:10:00').toISOString() },
        { feedbackId: 10, agentType: 'impact', score: 60, reasoning: 'Advanced search filters would benefit power users and improve content discovery.', createdAt: new Date('2024-02-15T12:15:00').toISOString() },
        { feedbackId: 10, agentType: 'novelty', score: 45, reasoning: 'Advanced search features are common but specific filter requirements show some uniqueness.', createdAt: new Date('2024-02-15T12:20:00').toISOString() },
        { feedbackId: 10, agentType: 'effort', score: 70, reasoning: 'Search enhancement requires database optimization and complex filtering logic implementation.', createdAt: new Date('2024-02-15T12:25:00').toISOString() },

        // Email Integration Bug (ID: 11)
        { feedbackId: 11, agentType: 'urgency', score: 70, reasoning: 'Email delivery failures impact user communication and business processes significantly.', createdAt: new Date('2024-02-18T09:30:00').toISOString() },
        { feedbackId: 11, agentType: 'impact', score: 65, reasoning: 'Email integration issues affect users relying on automated notifications and alerts.', createdAt: new Date('2024-02-18T09:35:00').toISOString() },
        { feedbackId: 11, agentType: 'sentiment', score: 75, reasoning: 'Users frustrated by missing important notifications and communication breakdowns.', createdAt: new Date('2024-02-18T09:40:00').toISOString() },

        // Bulk Operations Feature (ID: 12)
        { feedbackId: 12, agentType: 'urgency', score: 35, reasoning: 'Bulk operations would improve efficiency but users can currently complete tasks individually.', createdAt: new Date('2024-02-22T14:50:00').toISOString() },
        { feedbackId: 12, agentType: 'impact', score: 55, reasoning: 'Bulk actions requested by users managing large datasets, significant productivity gain.', createdAt: new Date('2024-02-22T14:55:00').toISOString() },
        { feedbackId: 12, agentType: 'novelty', score: 30, reasoning: 'Bulk operations are standard feature in data management applications, well-known patterns.', createdAt: new Date('2024-02-22T15:00:00').toISOString() },
        { feedbackId: 12, agentType: 'effort', score: 65, reasoning: 'Bulk operations require careful transaction handling and progress tracking implementation.', createdAt: new Date('2024-02-22T15:05:00').toISOString() },

        // Calendar Integration (ID: 13)
        { feedbackId: 13, agentType: 'urgency', score: 25, reasoning: 'Calendar sync would be convenient but not essential for core application functionality.', createdAt: new Date('2024-02-25T11:20:00').toISOString() },
        { feedbackId: 13, agentType: 'impact', score: 35, reasoning: 'Calendar integration benefits users who schedule frequently but limited overall impact.', createdAt: new Date('2024-02-25T11:25:00').toISOString() },
        { feedbackId: 13, agentType: 'effort', score: 50, reasoning: 'Calendar API integration requires authentication flows and sync logic implementation.', createdAt: new Date('2024-02-25T11:30:00').toISOString() },

        // Database Corruption Issue (ID: 14)
        { feedbackId: 14, agentType: 'urgency', score: 98, reasoning: 'Data corruption threatens data integrity and requires immediate investigation and resolution.', createdAt: new Date('2024-02-28T07:15:00').toISOString() },
        { feedbackId: 14, agentType: 'impact', score: 95, reasoning: 'Database corruption could lead to widespread data loss affecting all users and operations.', createdAt: new Date('2024-02-28T07:20:00').toISOString() },
        { feedbackId: 14, agentType: 'sentiment', score: 90, reasoning: 'Users extremely concerned about potential data loss and system reliability issues.', createdAt: new Date('2024-02-28T07:25:00').toISOString() },
        { feedbackId: 14, agentType: 'effort', score: 85, reasoning: 'Database corruption investigation requires extensive analysis and potential system recovery procedures.', createdAt: new Date('2024-02-28T07:30:00').toISOString() },

        // Keyboard Shortcuts (ID: 15)
        { feedbackId: 15, agentType: 'urgency', score: 20, reasoning: 'Keyboard shortcuts would improve user efficiency but application functions well without them.', createdAt: new Date('2024-03-03T16:40:00').toISOString() },
        { feedbackId: 15, agentType: 'impact', score: 25, reasoning: 'Shortcuts primarily benefit power users, limited impact on general user base.', createdAt: new Date('2024-03-03T16:45:00').toISOString() },
        { feedbackId: 15, agentType: 'novelty', score: 15, reasoning: 'Keyboard shortcuts are standard UI enhancement with established implementation patterns.', createdAt: new Date('2024-03-03T16:50:00').toISOString() },

        // Payment Processing Error (ID: 16)
        { feedbackId: 16, agentType: 'urgency', score: 92, reasoning: 'Payment failures directly impact revenue and prevent customers from completing purchases.', createdAt: new Date('2024-03-06T10:05:00').toISOString() },
        { feedbackId: 16, agentType: 'impact', score: 88, reasoning: 'Payment issues affect all purchasing customers and create immediate business revenue loss.', createdAt: new Date('2024-03-06T10:10:00').toISOString() },
        { feedbackId: 16, agentType: 'sentiment', score: 87, reasoning: 'Customers expressing frustration and concern about payment security and reliability.', createdAt: new Date('2024-03-06T10:15:00').toISOString() },
        { feedbackId: 16, agentType: 'effort', score: 45, reasoning: 'Payment gateway issue may require third-party service coordination and testing.', createdAt: new Date('2024-03-06T10:20:00').toISOString() },

        // Multi-language Support (ID: 17)
        { feedbackId: 17, agentType: 'urgency', score: 30, reasoning: 'Internationalization important for global expansion but not blocking current operations.', createdAt: new Date('2024-03-10T13:25:00').toISOString() },
        { feedbackId: 17, agentType: 'impact', score: 80, reasoning: 'Multi-language support critical for international market expansion and user accessibility.', createdAt: new Date('2024-03-10T13:30:00').toISOString() },
        { feedbackId: 17, agentType: 'novelty', score: 40, reasoning: 'I18n implementation follows established patterns but specific language requirements add complexity.', createdAt: new Date('2024-03-10T13:35:00').toISOString() },
        { feedbackId: 17, agentType: 'effort', score: 80, reasoning: 'Internationalization requires comprehensive text extraction, translation management, and testing.', createdAt: new Date('2024-03-10T13:40:00').toISOString() },

        // File Upload Limit (ID: 18)
        { feedbackId: 18, agentType: 'urgency', score: 55, reasoning: 'File size restrictions prevent users from uploading necessary documents for their workflows.', createdAt: new Date('2024-03-13T08:50:00').toISOString() },
        { feedbackId: 18, agentType: 'impact', score: 45, reasoning: 'Upload limitations affect users with large files but workarounds exist through compression.', createdAt: new Date('2024-03-13T08:55:00').toISOString() },
        { feedbackId: 18, agentType: 'sentiment', score: 60, reasoning: 'Users moderately frustrated by upload restrictions impacting their productivity.', createdAt: new Date('2024-03-13T09:00:00').toISOString() },

        // Social Media Integration (ID: 19)
        { feedbackId: 19, agentType: 'urgency', score: 20, reasoning: 'Social sharing features would be nice to have but not essential for core functionality.', createdAt: new Date('2024-03-16T15:10:00').toISOString() },
        { feedbackId: 19, agentType: 'impact', score: 30, reasoning: 'Social integration benefits marketing and user engagement but affects limited use cases.', createdAt: new Date('2024-03-16T15:15:00').toISOString() },
        { feedbackId: 19, agentType: 'novelty', score: 25, reasoning: 'Social media integration is common feature with well-established API patterns.', createdAt: new Date('2024-03-16T15:20:00').toISOString() },

        // Offline Mode Support (ID: 20)
        { feedbackId: 20, agentType: 'urgency', score: 45, reasoning: 'Offline functionality would improve user experience in poor connectivity situations.', createdAt: new Date('2024-03-20T12:35:00').toISOString() },
        { feedbackId: 20, agentType: 'impact', score: 55, reasoning: 'Offline support benefits mobile users and those with unreliable internet connections.', createdAt: new Date('2024-03-20T12:40:00').toISOString() },
        { feedbackId: 20, agentType: 'novelty', score: 70, reasoning: 'Offline-first architecture requires innovative sync strategies and conflict resolution.', createdAt: new Date('2024-03-20T12:45:00').toISOString() },
        { feedbackId: 20, agentType: 'effort', score: 90, reasoning: 'Offline support requires complete application architecture changes and sync mechanisms.', createdAt: new Date('2024-03-20T12:50:00').toISOString() },

        // Additional scores for various feedback items across different dates
        { feedbackId: 25, agentType: 'urgency', score: 65, reasoning: 'User interface inconsistency affects user experience and needs attention soon.', createdAt: new Date('2024-03-25T09:15:00').toISOString() },
        { feedbackId: 25, agentType: 'impact', score: 50, reasoning: 'UI inconsistencies noticed by regular users but not blocking critical workflows.', createdAt: new Date('2024-03-25T09:20:00').toISOString() },
        { feedbackId: 25, agentType: 'effort', score: 35, reasoning: 'Design system implementation requires coordination but follows established patterns.', createdAt: new Date('2024-03-25T09:25:00').toISOString() },

        { feedbackId: 33, agentType: 'urgency', score: 80, reasoning: 'Memory leak causing application crashes during extended usage sessions.', createdAt: new Date('2024-04-01T11:30:00').toISOString() },
        { feedbackId: 33, agentType: 'impact', score: 70, reasoning: 'Memory issues affect users with long-running sessions, impacting productivity.', createdAt: new Date('2024-04-01T11:35:00').toISOString() },
        { feedbackId: 33, agentType: 'sentiment', score: 78, reasoning: 'Users frustrated by unexpected crashes and loss of unsaved work.', createdAt: new Date('2024-04-01T11:40:00').toISOString() },

        { feedbackId: 42, agentType: 'urgency', score: 25, reasoning: 'Color scheme customization would be nice for user personalization but not urgent.', createdAt: new Date('2024-04-05T14:20:00').toISOString() },
        { feedbackId: 42, agentType: 'impact', score: 20, reasoning: 'Theme customization affects small subset of users interested in personalization.', createdAt: new Date('2024-04-05T14:25:00').toISOString() },
        { feedbackId: 42, agentType: 'novelty', score: 15, reasoning: 'Theme customization is standard feature in most applications with known implementation.', createdAt: new Date('2024-04-05T14:30:00').toISOString() },

        { feedbackId: 58, agentType: 'urgency', score: 88, reasoning: 'Security vulnerability in authentication system requires immediate patching.', createdAt: new Date('2024-04-10T08:00:00').toISOString() },
        { feedbackId: 58, agentType: 'impact', score: 92, reasoning: 'Authentication vulnerability could compromise all user accounts and sensitive data.', createdAt: new Date('2024-04-10T08:05:00').toISOString() },
        { feedbackId: 58, agentType: 'sentiment', score: 85, reasoning: 'Security concerns raised by users create anxiety about data protection.', createdAt: new Date('2024-04-10T08:10:00').toISOString() },
        { feedbackId: 58, agentType: 'effort', score: 60, reasoning: 'Security patch requires careful testing and potential breaking changes coordination.', createdAt: new Date('2024-04-10T08:15:00').toISOString() },

        { feedbackId: 67, agentType: 'urgency', score: 40, reasoning: 'Report generation speed could be improved but current performance is acceptable.', createdAt: new Date('2024-04-15T10:45:00').toISOString() },
        { feedbackId: 67, agentType: 'impact', score: 55, reasoning: 'Faster reports would benefit users generating frequent analytics and summaries.', createdAt: new Date('2024-04-15T10:50:00').toISOString() },
        { feedbackId: 67, agentType: 'effort', score: 50, reasoning: 'Report optimization requires database query tuning and caching implementation.', createdAt: new Date('2024-04-15T10:55:00').toISOString() },

        { feedbackId: 75, agentType: 'urgency', score: 30, reasoning: 'Additional chart types would enhance data visualization but current options are sufficient.', createdAt: new Date('2024-04-20T13:10:00').toISOString() },
        { feedbackId: 75, agentType: 'impact', score: 35, reasoning: 'Enhanced charting benefits users creating presentations and detailed analytics.', createdAt: new Date('2024-04-20T13:15:00').toISOString() },
        { feedbackId: 75, agentType: 'novelty', score: 40, reasoning: 'Specific chart types requested show some unique visualization requirements.', createdAt: new Date('2024-04-20T13:20:00').toISOString() },

        { feedbackId: 89, agentType: 'urgency', score: 75, reasoning: 'API rate limiting errors preventing integration partners from functioning properly.', createdAt: new Date('2024-04-25T16:25:00').toISOString() },
        { feedbackId: 89, agentType: 'impact', score: 80, reasoning: 'Rate limiting issues affect business partnerships and third-party integrations.', createdAt: new Date('2024-04-25T16:30:00').toISOString() },
        { feedbackId: 89, agentType: 'sentiment', score: 70, reasoning: 'Integration partners expressing concern about service reliability and SLA compliance.', createdAt: new Date('2024-04-25T16:35:00').toISOString() },

        { feedbackId: 95, agentType: 'urgency', score: 50, reasoning: 'Backup and restore functionality important for data safety but current system is stable.', createdAt: new Date('2024-05-01T09:40:00').toISOString() },
        { feedbackId: 95, agentType: 'impact', score: 75, reasoning: 'Data backup critical for business continuity and disaster recovery planning.', createdAt: new Date('2024-05-01T09:45:00').toISOString() },
        { feedbackId: 95, agentType: 'effort', score: 65, reasoning: 'Backup system implementation requires storage infrastructure and automated scheduling.', createdAt: new Date('2024-05-01T09:50:00').toISOString() },

        { feedbackId: 103, agentType: 'urgency', score: 35, reasoning: 'User activity tracking would provide valuable insights but not immediately needed.', createdAt: new Date('2024-05-05T12:15:00').toISOString() },
        { feedbackId: 103, agentType: 'impact', score: 40, reasoning: 'Analytics tracking helps understand user behavior and improve product decisions.', createdAt: new Date('2024-05-05T12:20:00').toISOString() },
        { feedbackId: 103, agentType: 'novelty', score: 30, reasoning: 'User analytics implementation follows standard patterns with established tools.', createdAt: new Date('2024-05-05T12:25:00').toISOString() },

        { feedbackId: 117, agentType: 'urgency', score: 85, reasoning: 'Data synchronization failures causing data loss between client and server.', createdAt: new Date('2024-05-10T07:30:00').toISOString() },
        { feedbackId: 117, agentType: 'impact', score: 85, reasoning: 'Sync issues result in user work being lost and create data inconsistencies.', createdAt: new Date('2024-05-10T07:35:00').toISOString() },
        { feedbackId: 117, agentType: 'sentiment', score: 90, reasoning: 'Users extremely frustrated by losing work due to synchronization problems.', createdAt: new Date('2024-05-10T07:40:00').toISOString() },
        { feedbackId: 117, agentType: 'effort', score: 70, reasoning: 'Sync reliability requires conflict resolution logic and retry mechanisms.', createdAt: new Date('2024-05-10T07:45:00').toISOString() },

        { feedbackId: 124, agentType: 'urgency', score: 22, reasoning: 'Additional export formats would be convenient but current options meet most needs.', createdAt: new Date('2024-05-15T14:55:00').toISOString() },
        { feedbackId: 124, agentType: 'impact', score: 25, reasoning: 'Format variety benefits users with specific workflow requirements but limited scope.', createdAt: new Date('2024-05-15T15:00:00').toISOString() },
        { feedbackId: 124, agentType: 'effort', score: 25, reasoning: 'Additional export formats require library integration and format validation logic.', createdAt: new Date('2024-05-15T15:05:00').toISOString() },

        { feedbackId: 138, agentType: 'urgency', score: 60, reasoning: 'Mobile responsiveness issues affect user experience on tablets and phones.', createdAt: new Date('2024-05-20T11:20:00').toISOString() },
        { feedbackId: 138, agentType: 'impact', score: 65, reasoning: 'Mobile usage growing and responsive design critical for user retention.', createdAt: new Date('2024-05-20T11:25:00').toISOString() },
        { feedbackId: 138, agentType: 'sentiment', score: 55, reasoning: 'Mobile users expressing mild frustration with interface usability on smaller screens.', createdAt: new Date('2024-05-20T11:30:00').toISOString() },

        { feedbackId: 145, agentType: 'urgency', score: 95, reasoning: 'Server outage causing complete service unavailability for all users.', createdAt: new Date('2024-05-25T06:15:00').toISOString() },
        { feedbackId: 145, agentType: 'impact', score: 100, reasoning: 'System outage affects entire user base and halts all business operations.', createdAt: new Date('2024-05-25T06:20:00').toISOString() },
        { feedbackId: 145, agentType: 'sentiment', score: 95, reasoning: 'Users unable to work and expressing severe frustration about service reliability.', createdAt: new Date('2024-05-25T06:25:00').toISOString() },

        { feedbackId: 156, agentType: 'urgency', score: 28, reasoning: 'Font customization options would improve accessibility but current fonts are readable.', createdAt: new Date('2024-06-01T15:40:00').toISOString() },
        { feedbackId: 156, agentType: 'impact', score: 35, reasoning: 'Font options particularly benefit users with visual accessibility needs.', createdAt: new Date('2024-06-01T15:45:00').toISOString() },
        { feedbackId: 156, agentType: 'novelty', score: 20, reasoning: 'Font customization is standard accessibility feature with established implementation.', createdAt: new Date('2024-06-01T15:50:00').toISOString() },

        { feedbackId: 167, agentType: 'urgency', score: 70, reasoning: 'Form validation errors confusing users and preventing successful submissions.', createdAt: new Date('2024-06-05T10:30:00').toISOString() },
        { feedbackId: 167, agentType: 'impact', score: 60, reasoning: 'Validation issues prevent users from completing important forms and workflows.', createdAt: new Date('2024-06-05T10:35:00').toISOString() },
        { feedbackId: 167, agentType: 'sentiment', score: 65, reasoning: 'Users frustrated by unclear error messages and form submission failures.', createdAt: new Date('2024-06-05T10:40:00').toISOString() },
        { feedbackId: 167, agentType: 'effort', score: 30, reasoning: 'Form validation improvements require better error messaging and field highlighting.', createdAt: new Date('2024-06-05T10:45:00').toISOString() },

        { feedbackId: 178, agentType: 'urgency', score: 45, reasoning: 'Advanced filtering options would improve search efficiency but basic filters work.', createdAt: new Date('2024-06-10T13:50:00').toISOString() },
        { feedbackId: 178, agentType: 'impact', score: 50, reasoning: 'Enhanced filters benefit power users who need to find specific information quickly.', createdAt: new Date('2024-06-10T13:55:00').toISOString() },
        { feedbackId: 178, agentType: 'effort', score: 55, reasoning: 'Advanced filtering requires database query optimization and UI component enhancement.', createdAt: new Date('2024-06-10T14:00:00').toISOString() },

        { feedbackId: 189, agentType: 'urgency', score: 80, reasoning: 'Memory consumption growing over time leading to browser crashes and poor performance.', createdAt: new Date('2024-06-15T08:25:00').toISOString() },
        { feedbackId: 189, agentType: 'impact', score: 75, reasoning: 'Memory leaks affect users during extended sessions causing frustration and lost work.', createdAt: new Date('2024-06-15T08:30:00').toISOString() },
        { feedbackId: 189, agentType: 'sentiment', score: 80, reasoning: 'Users reporting frequent crashes and performance degradation over time.', createdAt: new Date('2024-06-15T08:35:00').toISOString() },

        { feedbackId: 195, agentType: 'urgency', score: 32, reasoning: 'Customizable dashboard layouts would improve user experience but current layout is functional.', createdAt: new Date('2024-06-20T12:10:00').toISOString() },
        { feedbackId: 195, agentType: 'impact', score: 40, reasoning: 'Dashboard customization benefits users who need specific information prominently displayed.', createdAt: new Date('2024-06-20T12:15:00').toISOString() },
        { feedbackId: 195, agentType: 'novelty', score: 35, reasoning: 'Customizable dashboards common feature but specific layout requirements show some uniqueness.', createdAt: new Date('2024-06-20T12:20:00').toISOString() }
    ];

    await db.insert(swarmScores).values(sampleSwarmScores);
    
    console.log('✅ Swarm scores seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});