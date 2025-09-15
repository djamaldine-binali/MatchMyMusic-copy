const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer ou récupérer une conversation pour un match
async function getOrCreateConversation(matchId) {
  try {
    // Vérifier si la conversation existe déjà
    let conversation = await prisma.conversation.findUnique({
      where: { matchId }
    });

    // Si elle n'existe pas, la créer
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { matchId }
      });
    }

    return conversation;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw new Error(`Erreur lors de la récupération/création de la conversation: ${error.message}`);
  }
}

// Envoyer un message
async function sendMessage(conversationId, senderId, content) {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Le message ne peut pas être vide');
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId,
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // Mettre à jour la date de dernière activité de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Erreur lors de l'envoi du message: ${error.message}`);
  }
}

// Récupérer les messages d'une conversation
async function getConversationMessages(conversationId, page = 1, pageSize = 50) {
  try {
    const skip = (page - 1) * pageSize;
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: pageSize
      }),
      prisma.message.count({ where: { conversationId } })
    ]);

    return { messages, total, page, pageSize };
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
  }
}

// Récupérer toutes les conversations d'un utilisateur
async function getUserConversations(userId) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      },
      include: {
        match: {
          include: {
            userA: {
              select: {
                id: true,
                username: true
              }
            },
            userB: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Formater les conversations pour le frontend
    return conversations.map(conv => {
      const otherUser = conv.match.userAId === userId ? conv.match.userB : conv.match.userA;
      const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;
      
      return {
        id: conv.id,
        matchId: conv.match.id,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender.username,
          createdAt: lastMessage.createdAt
        } : null,
        messageCount: conv._count.messages,
        updatedAt: conv.updatedAt
      };
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw new Error(`Erreur lors de la récupération des conversations: ${error.message}`);
  }
}

// Vérifier si un utilisateur peut accéder à une conversation
async function canAccessConversation(userId, conversationId) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        match: true
      }
    });

    if (!conversation) {
      return false;
    }

    // Vérifier que l'utilisateur fait partie du match
    if (conversation.match.userAId !== userId && conversation.match.userBId !== userId) {
      return false;
    }

    // Vérifier qu'il n'y a pas de blocage entre les utilisateurs
    const otherUserId = conversation.match.userAId === userId 
      ? conversation.match.userBId 
      : conversation.match.userAId;

    const [block1, block2] = await Promise.all([
      prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: otherUserId
          }
        }
      }),
      prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: otherUserId,
            blockedId: userId
          }
        }
      })
    ]);

    // Si un des utilisateurs a bloqué l'autre, pas d'accès
    if (block1 || block2) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking conversation access:', error);
    return false;
  }
}

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  getUserConversations,
  canAccessConversation
}; 